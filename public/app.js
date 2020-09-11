const { protocol, host } = window.location,
      form    = document.querySelector('form'),
      error   = document.querySelector('.error'),
      created = document.querySelector('.created');

error.style.display = 'none';
console.log(protocol, host);

form.addEventListener('submit', async (e) => {

    e.preventDefault();

    const formData = new FormData(form),
          url      = formData.get('url'),
          slug     = formData.get('slug');

    const options  = {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url: url, slug: slug || undefined })
    };

    const response = await fetch(`${protocol}//${host}/url`, options);
    if (response.status === 429) displayError('You are sending too many requests. Try again in 30 seconds.');

    const result = await response.json();
    if (response.ok && result.slug) displaySlug(result.slug);
    if (!response.ok) displayError(result.message);
});

function displayError(msg) {
    error.style.display = '';
    error.textContent = msg;
};

function displaySlug(slug) {
    const content  = document.createElement('p'),
          shorturl = `${protocol}//${host}/${slug}`;

    form.style.display  = 'none';
    error.style.display = 'none';
    content.innerHTML   = `Your short url is: <a href="${shorturl}">${shorturl}</a>`;
    created.appendChild(content);
};