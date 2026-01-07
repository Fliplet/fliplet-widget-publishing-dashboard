# Session Authentication Best Practices

## Recommended Approach

Use `$.ajax()` with `withCredentials` for Studio session authentication:

```javascript
// Use $.ajax() with withCredentials for Studio session auth
function callAPI(endpoint) {
  var apiUrl = Fliplet.Navigate.query.apiUrl || Fliplet.Env.get('apiUrl');

  return $.ajax({
    url: apiUrl + '/' + endpoint,
    method: 'GET',
    xhrFields: {
      withCredentials: true  // Inherit Studio cookies
    }
  });
}

callAPI('v1/organizations').then(function(response) {
  // Response authenticated as Studio user
});
```

---

## What NOT to Use

❌ `Fliplet.User.getCachedSession()` - returns app session, not Studio session  
❌ `Fliplet.API.request()` without modifications - uses app token, can't specify `withCredentials`  
❌ `Fliplet.Navigate.query.auth_token` - may be deprecated, not always available

---

## Benefits

### Simple Implementation

✅ One function change (`request()`)  
✅ No breaking changes to middleware API  
✅ API Tester continues working  
✅ All 27 middleware functions work unchanged

### Proven Pattern

✅ Same as `Fliplet.Session` uses (line 62-64 in `fliplet-session/1.0/session.js`)  
✅ Works with existing CORS configuration  
✅ No complex token management

### Future-Proof

✅ Easy to migrate when `Fliplet.API.request()` adds support  
✅ Only one function needs updating  
✅ All middleware continues working

### Multi-Region Ready

✅ Supports `?apiUrl=` query parameter  
✅ Works with US, EU, and other regions  
✅ Consistent with Fliplet patterns

---

## Summary

### What Changed

- **`request()` function:** Replaced `Fliplet.API.request()` with `$.ajax()` + `withCredentials: true`
- **`getOrganizationApps()`:** Removed `userId` parameter (API infers from session)
- **Multi-region support:** Added `apiUrl` query parameter handling

### What Stayed the Same

- All middleware function signatures (except `getOrganizationApps`)
- All middleware function logic
- API Tester interface
- Error handling patterns
- Return value structures

---

## Impact

✅ Minimal code changes  
✅ No breaking changes  
✅ Works with existing CORS  
✅ Applicable to all iFramed web apps









