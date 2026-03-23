import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://vbabbuqataokwffacmam.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiYWJidXFhdGFva3dmZmFjbWFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMTUxNDIsImV4cCI6MjA4OTc5MTE0Mn0.59-aGoxBI39iInaq_cG2ZbCz_oXqbtKpFepk_LBmdPs'

const supabase = createClient(supabaseUrl, supabaseKey)

const modal = document.getElementById('passwordModal')
const message = document.getElementById('message')

// Show modal
document.getElementById('changePasswordBtn').onclick = () => {
  modal.style.display = 'block'
}

// Close modal
window.closePasswordModal = () => {
  modal.style.display = 'none'
}

// Logout
document.getElementById('logoutBtn').onclick = async () => {
  await supabase.auth.signOut()
  window.location.href = 'index.html'
}

// Save new password
document.getElementById('savePassword').onclick = async () => {
  const oldPass = document.getElementById('oldPassword').value
  const newPass = document.getElementById('newPassword').value
  const confirmPass = document.getElementById('confirmPassword').value

  if (!oldPass || !newPass || !confirmPass) {
    message.textContent = 'All fields are required'
    return
  }

  if (newPass !== confirmPass) {
    message.textContent = 'New passwords do not match'
    return
  }

  // ✅ Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    message.textContent = 'Unable to get user info'
    return
  }

  // Re-authenticate by signing in with old password
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: oldPass
  })

  if (signInError) {
    message.textContent = 'Old password is incorrect'
    return
  }

  // Update password
  const { data, error: updateError } = await supabase.auth.updateUser({
    password: newPass
  })

  if (updateError) {
    message.textContent = updateError.message
    return
  }

  message.style.color = 'green'
  message.textContent = 'Password updated successfully. Please login again.'

  await supabase.auth.signOut()
  window.location.href = 'index.html'
}

const userNameSpan = document.getElementById('userName');
const userEmailSpan = document.getElementById('userEmail');

async function loadUserProfile() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    message.textContent = 'Could not get user information.';
    return;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('name, email')
    .eq('email', user.email)
    .single();

  if (profileError) {
    message.textContent = profileError.message;
    return;
  }

  if (profile) {
    userNameSpan.textContent = profile.name;
    userEmailSpan.textContent = profile.email;
  }
}

loadUserProfile();
