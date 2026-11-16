const loginForm = document.getElementById('login-form');

if (loginForm) {
  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    const errorMessage = document.getElementById('login-error');
    const submitButton = loginForm.querySelector('button[type="submit"]');
    errorMessage.textContent = '';
    submitButton.disabled = true;

    try {
      const response = await fetch(window.raceApiUrl('/api/login'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: document.getElementById('access-password').value }),
      });
      const result = await response.json();
      if (!response.ok) {
        errorMessage.textContent = result.error || 'Unable to sign in.';
        return;
      }
      window.location.replace('/index.html');
    } catch (error) {
      console.error('Sign-in request failed.', error);
      errorMessage.textContent = 'Unable to contact the sign-in server. Please try again.';
    } finally {
      submitButton.disabled = false;
    }
  });
}
