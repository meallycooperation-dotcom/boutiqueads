// 🔥 IMPORT SUPABASE
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 👉 REPLACE WITH YOUR KEYS
const supabaseUrl = 'https://vbabbuqataokwffacmam.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiYWJidXFhdGFva3dmZmFjbWFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMTUxNDIsImV4cCI6MjA4OTc5MTE0Mn0.59-aGoxBI39iInaq_cG2ZbCz_oXqbtKpFepk_LBmdPs'

const supabase = createClient(supabaseUrl, supabaseKey)

const form = document.getElementById('loginForm')
const message = document.getElementById('message')

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  // 🔐 STEP 1: Login user
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    message.textContent = error.message
    return
  }

  // 🔍 STEP 2: Check if user is admin in profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('email', email)
    .single()

  if (profileError || !profile) {
    message.textContent = "Profile not found"
    return
  }

  if (profile.role !== 'admin') {
    message.textContent = "Access denied: Not an admin"

    // 🚪 Optional: log them out immediately
    await supabase.auth.signOut()
    return
  }

  // ✅ SUCCESS
  message.style.color = "green"
  message.textContent = "Welcome Admin!"

  // 🔁 Redirect
  try {
    console.log("Redirecting to home.html...");
    window.location.href = "home.html";
  } catch (e) {
    console.error("Redirection failed:", e);
    message.textContent = "Redirection failed. Please check the console for errors.";
  }
})