import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 🔑 Supabase keys
const supabaseUrl = 'https://vbabbuqataokwffacmam.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiYWJidXFhdGFva3dmZmFjbWFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMTUxNDIsImV4cCI6MjA4OTc5MTE0Mn0.59-aGoxBI39iInaq_cG2ZbCz_oXqbtKpFepk_LBmdPs'

const supabase = createClient(supabaseUrl, supabaseKey)

const form = document.getElementById('productForm')
const message = document.getElementById('message')

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const name = document.getElementById('name').value
  const description = document.getElementById('description').value
  const price = parseFloat(document.getElementById('price').value)
  const stockCount = parseInt(document.getElementById('stockCount').value)
  const imageFile = document.getElementById('image').files[0]

  if (!imageFile) {
    message.textContent = "Please select an image"
    return
  }

  // Auto-set in_stock based on stockCount
  const inStock = stockCount > 0

  try {
    // 📤 Upload image to Supabase Storage
    const fileName = `${Date.now()}-${imageFile.name}`

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, imageFile)

    if (uploadError) throw uploadError

    // 🌐 Get public URL
    const { data: urlData } = supabase.storage
      .from('products')
      .getPublicUrl(fileName)

    const imageUrl = urlData.publicUrl

    // 💾 Insert into products table
    const { error: insertError } = await supabase
      .from('products')
      .insert([
        {
          name,
          description,
          price,
          in_stock: inStock,
          stock_count: stockCount,
          image_url: imageUrl
        }
      ])

    if (insertError) throw insertError

    // ✅ Success
    message.style.color = "green"
    message.textContent = "Product uploaded successfully!"
    form.reset()
  } catch (err) {
    message.style.color = "red"
    message.textContent = err.message
  }
})