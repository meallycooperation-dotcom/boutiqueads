import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://vbabbuqataokwffacmam.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiYWJidXFhdGFva3dmZmFjbWFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMTUxNDIsImV4cCI6MjA4OTc5MTE0Mn0.59-aGoxBI39iInaq_cG2ZbCz_oXqbtKpFepk_LBmdPs'

const supabase = createClient(supabaseUrl, supabaseKey)

const inventoryBody = document.getElementById('inventoryBody')

// Fetch products from Supabase
async function loadInventory() {
  const { data, error } = await supabase.from('products').select('*')

  if (error) {
    inventoryBody.innerHTML = `<tr><td colspan="3" style="color:red">${error.message}</td></tr>`
    document.getElementById('totalValue').textContent = ''
    return
  }

  inventoryBody.innerHTML = ''

  data.forEach(product => {
    const row = document.createElement('tr')
    if (!product.in_stock || product.stock_count <= 0) {
      row.classList.add('out-of-stock')
    }

    row.innerHTML = `
      <td data-label="Product Name">${product.name}</td>
      <td data-label="Price">${product.price}</td>
      <td data-label="Stock Count">${product.stock_count}</td>
    `
    inventoryBody.appendChild(row)
  })

  // Calculate total stock value
  const totalValue = data.reduce((sum, product) => sum + (product.price * product.stock_count), 0)
  document.getElementById('totalValue').textContent = `Total Stock Value: KSh ${totalValue.toLocaleString()}`
}

loadInventory()