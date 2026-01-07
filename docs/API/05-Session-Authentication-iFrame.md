# Session Authentication for iFramed Web Apps

## Special Case: Studio iFrame Context

When building web apps that will be loaded as iFrames in Fliplet Studio, session handling differs from standard Fliplet apps.

---

## The Challenge

- App needs to authenticate as the Studio user, not the app user
- Standard `Fliplet.User.getCachedSession()` returns the app session (wrong context)
- App token authentication doesn't work for Studio APIs

---

## The Solution: Cookie-Based Authentication

Use `$.ajax()` with `withCredentials: true` instead of `Fliplet.API.request()`:

```javascript
function request(method, endpoint, options) {
  options = options || {};

  // Get API URL (supports multi-region)
  var apiUrl = Fliplet.Navigate.query.apiUrl || Fliplet.Env.get('apiUrl');
  if (apiUrl && apiUrl[apiUrl.length - 1] !== '/') {
    apiUrl += '/';
  }

  return $.ajax({
    url: apiUrl + endpoint,
    method: method,
    xhrFields: {
      withCredentials: true  // Inherit Studio session cookies
    },
    headers: options.headers || {},
    contentType: 'application/json',
    data: options.body ? JSON.stringify(options.body) : undefined
  });
}
```

---

## Why This Works

1. Browser automatically sends Studio session cookies with the request
2. API's CORS configuration allows credentials from Studio origin
3. API authenticates using the Studio user's session
4. Same pattern used by Fliplet.Session APIs

---

## When to Use

✅ Web apps loaded in Studio iFrames  
✅ Apps accessing Studio-level APIs (organizations, users, etc.)  
✅ Apps that need Studio user context, not app user context

---

## When NOT to Use

❌ Standard Fliplet apps (use `Fliplet.API.request()` as normal)  
❌ Apps with their own user authentication (use app sessions)  
❌ Public/anonymous apps

---

## Multi-Region Support

Handle different API regions via query parameter:

```javascript
// App loaded with: ?apiUrl=https://us.api.fliplet.com
var apiUrl = Fliplet.Navigate.query.apiUrl || Fliplet.Env.get('apiUrl');
```

---

## Future Migration

When `Fliplet.API.request()` adds `withCredentials` support, update the `request()` wrapper function. All middleware continues working unchanged.

---

## See Also

- **Phase 1.10: Session Cookie Authentication** - Complete implementation guide
- **CORS Configuration** - API CORS setup









