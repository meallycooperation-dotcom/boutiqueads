import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 🔑 Supabase keys
const supabaseUrl = 'https://vbabbuqataokwffacmam.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiYWJidXFhdGFva3dmZmFjbWFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMTUxNDIsImV4cCI6MjA4OTc5MTE0Mn0.59-aGoxBI39iInaq_cG2ZbCz_oXqbtKpFepk_LBmdPs'

const supabase = createClient(supabaseUrl, supabaseKey)

const container = document.getElementById('products')
const modal = document.getElementById('modal')

let currentId = null

// 🍔 Hamburger toggle
document.getElementById('hamburger').onclick = () => {
  document.getElementById('nav').classList.toggle('active')
}

// 📦 Load products
async function loadProducts() {
  const { data, error } = await supabase.from('products').select('*')

  if (error) {
    container.innerHTML = `<p style="color:red">${error.message}</p>`
    return
  }

  container.innerHTML = ''

  data.forEach(product => {
    const card = document.createElement('div')
    card.className = 'card'

    card.innerHTML = `
      <img src="${product.image_url}" />
      <h3>${product.name}</h3>
      <div class="card-buttons">
        <button onclick="editProduct(${product.id}, '${product.image_url}', ${product.price}, ${product.in_stock}, ${product.stock_count})">Edit</button>
        <button onclick="deleteProduct(${product.id})">Delete</button>
      </div>
      <h4>KSh ${product.price}</h4>
      <p>Stock: ${product.stock_count} ${!product.in_stock ? '(Out of stock)' : ''}</p>
    `

    container.appendChild(card)
  })
}

loadProducts()

// ✏️ Edit product
window.editProduct = (id, image, price, inStock, stockCount) => {
  currentId = id
  modal.style.display = 'block'

  document.getElementById('currentImage').src = image
  document.getElementById('editPrice').value = price
  document.getElementById('editStock').checked = inStock
  document.getElementById('editStockCount').value = stockCount
}

// ❌ Close modal
window.closeModal = () => {
  modal.style.display = 'none'
}

// 💾 Save edit
document.getElementById('saveEdit').onclick = async () => {
  const currentImageUrl = document.getElementById('currentImage').src
  const imageFile = document.getElementById('editImageFile').files[0]
  const price = parseFloat(document.getElementById('editPrice').value)
  const inStock = document.getElementById('editStock').checked
  const stockCount = parseInt(document.getElementById('editStockCount').value)

  let imageUrl = currentImageUrl

  if (imageFile) {
    // 📤 Upload new image to Supabase Storage
    const fileName = `${Date.now()}-${imageFile.name}`

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, imageFile)

    if (uploadError) {
      alert(uploadError.message)
      return
    }

    // 🌐 Get public URL
    const { data: urlData } = supabase.storage
      .from('products')
      .getPublicUrl(fileName)

    imageUrl = urlData.publicUrl
  }

  // Optional: auto set inStock based on stockCount
  const updatedStock = stockCount > 0

  const { error } = await supabase
    .from('products')
    .update({
      image_url: imageUrl,
      price: price,
      in_stock: updatedStock,
      stock_count: stockCount
    })
    .eq('id', currentId)

  if (error) {
    alert(error.message)
    return
  }

  closeModal()
  loadProducts()
}

// 🗑️ Delete product
window.deleteProduct = async (id) => {
  const confirmDelete = confirm("Are you sure you want to delete this product?")
  if (!confirmDelete) return

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    alert(error.message)
    return
  }

  loadProducts()
}