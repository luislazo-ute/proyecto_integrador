$ErrorActionPreference = 'Stop'

$base = $env:API_BASE
if (-not $base) { $base = 'http://localhost:3000' }

function Login($username, $password) {
  $body = @{ username = $username; password = $password } | ConvertTo-Json
  return Invoke-RestMethod -Method Post -Uri ($base + '/auth/login') -ContentType 'application/json' -Body $body
}

# wait for server by retrying login
$login = $null
for ($i = 0; $i -lt 30; $i++) {
  try {
    $login = Login 'admin' 'admin123'
    break
  } catch {
    Start-Sleep -Milliseconds 300
  }
}
if (-not $login) { throw "No se pudo hacer login admin en $base" }

$headers = @{ Authorization = ('Bearer ' + $login.access_token) }

$roles = Invoke-RestMethod -Method Get -Uri ($base + '/rol') -Headers $headers
$rolBodega = $roles | Where-Object { $_.nombre -eq 'BODEGA' } | Select-Object -First 1
$rolLog = $roles | Where-Object { $_.nombre -eq 'LOGISTICA' } | Select-Object -First 1
if (-not $rolBodega -or -not $rolLog) { throw 'Faltan roles (seed no ejecutado?)' }

$bodegas = Invoke-RestMethod -Method Get -Uri ($base + '/bodega') -Headers $headers
$principal = $bodegas | Where-Object { $_.nombre -eq 'Bodega Principal' } | Select-Object -First 1
if (-not $principal) { throw 'No se encontró Bodega Principal (seed no ejecutado?)' }

$stamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$b2 = Invoke-RestMethod -Method Post -Uri ($base + '/bodega') -Headers $headers -ContentType 'application/json' -Body (@{ nombre = "Bodega Norte $stamp"; ubicacion = 'Sucursal Norte' } | ConvertTo-Json)
$b3 = Invoke-RestMethod -Method Post -Uri ($base + '/bodega') -Headers $headers -ContentType 'application/json' -Body (@{ nombre = "Bodega Sur $stamp"; ubicacion = 'Sucursal Sur' } | ConvertTo-Json)

$uBodegaUsername = "bodega1_$stamp"
$createdBodegaUser = Invoke-RestMethod -Method Post -Uri ($base + '/usuario') -Headers $headers -ContentType 'application/json' -Body (@{
  nombre = 'Bodeguero Uno'
  username = $uBodegaUsername
  password = 'test1234'
  email = "$uBodegaUsername@test.com"
  telefono = '0999999999'
  estado = $true
  id_rol = $rolBodega._id
  id_bodega = $b2.id_bodega
} | ConvertTo-Json)

$uLogUsername = "log1_$stamp"
$createdLogUser = Invoke-RestMethod -Method Post -Uri ($base + '/usuario') -Headers $headers -ContentType 'application/json' -Body (@{
  nombre = 'Logistica Uno'
  username = $uLogUsername
  password = 'test1234'
  email = "$uLogUsername@test.com"
  telefono = '0888888888'
  estado = $true
  id_rol = $rolLog._id
} | ConvertTo-Json)

# LOGISTICA: debe poder leer bodegas (para poder operar guías/rutas)
$loginL = Login $uLogUsername 'test1234'
$hL = @{ Authorization = ('Bearer ' + $loginL.access_token) }
$bodegasForLog = Invoke-RestMethod -Method Get -Uri ($base + '/bodega') -Headers $hL
if (-not $bodegasForLog -or $bodegasForLog.Count -lt 1) { throw 'LOGISTICA no pudo leer bodegas' }

$cats = Invoke-RestMethod -Method Get -Uri ($base + '/categoria') -Headers $headers
$cat = $cats | Select-Object -First 1
if (-not $cat) { throw 'Necesitas al menos 1 categoría para crear producto' }

# POST /producto es multipart/form-data (sin archivo)
$form = [ordered]@{
  id_categoria = $cat.id_categoria
  nombre = "Prod Ciclo $stamp"
  descripcion = 'test'
  precio_compra = '10'
  precio_venta = '15'
  stock_actual = '10'
  peso = '1'
  tipo_unidad = 'UN'
  unidad_embalaje = 'CAJA'
  estado = 'true'
}

$boundary = [Guid]::NewGuid().ToString()
$lf = "`r`n"
$body = ''
foreach ($k in $form.Keys) {
  $body += "--$boundary$lf"
  $body += "Content-Disposition: form-data; name=`"$k`"$lf$lf"
  $body += "$($form[$k])$lf"
}
$body += "--$boundary--$lf"

$prod = Invoke-RestMethod -Method Post -Uri ($base + '/producto') -Headers $headers -ContentType ("multipart/form-data; boundary=$boundary") -Body $body

# stock inicial debe caer en Bodega Principal
$stockPrincipal = Invoke-RestMethod -Method Get -Uri ($base + '/stock-bodega/' + $principal.id_bodega) -Headers $headers
$sbp = $stockPrincipal | Where-Object { $_.id_producto -eq $prod.id_producto } | Select-Object -First 1

# transfer 5 de principal -> b2
$mov = @{ id_bodega_origen = $principal.id_bodega; id_bodega_destino = $b2.id_bodega; items = @(@{ id_producto = $prod.id_producto; cantidad = 5 }); observacion = 'Transfer test' } | ConvertTo-Json -Depth 5
$movRes = Invoke-RestMethod -Method Post -Uri ($base + '/movimiento-inventario') -Headers $headers -ContentType 'application/json' -Body $mov

$stockB2 = Invoke-RestMethod -Method Get -Uri ($base + '/stock-bodega/' + $b2.id_bodega) -Headers $headers
$sb2 = $stockB2 | Where-Object { $_.id_producto -eq $prod.id_producto } | Select-Object -First 1

# BODEGA user: origen forzado a su bodega (b2)
$loginB = Login $uBodegaUsername 'test1234'
$hB = @{ Authorization = ('Bearer ' + $loginB.access_token) }
$mov2 = @{ id_bodega_origen = $principal.id_bodega; id_bodega_destino = $b3.id_bodega; items = @(@{ id_producto = $prod.id_producto; cantidad = 2 }); observacion = 'BODEGA transfer test' } | ConvertTo-Json -Depth 5
$movRes2 = Invoke-RestMethod -Method Post -Uri ($base + '/movimiento-inventario') -Headers $hB -ContentType 'application/json' -Body $mov2

$stockB3 = Invoke-RestMethod -Method Get -Uri ($base + '/stock-bodega/' + $b3.id_bodega) -Headers $headers
$sb3 = $stockB3 | Where-Object { $_.id_producto -eq $prod.id_producto } | Select-Object -First 1

# usuario list must have string _id
$usuarios = Invoke-RestMethod -Method Get -Uri ($base + '/usuario') -Headers $headers
$one = $usuarios | Select-Object -First 1

[PSCustomObject]@{
  principalId = $principal.id_bodega
  bodega2Id = $b2.id_bodega
  bodega3Id = $b3.id_bodega
  productoId = $prod.id_producto
  stockPrincipal = $sbp.stock
  stockBodega2 = $sb2.stock
  stockBodega3 = $sb3.stock
  logisticaBodegasCount = $bodegasForLog.Count
  usuarioIdType = $one._id.GetType().FullName
  usuarioIdSample = $one._id
} | Format-List
