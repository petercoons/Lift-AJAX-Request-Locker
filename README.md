About:

This is a JavaScript based method of preventing multiple AJAX requests to a Lift server. The method works by checking for the lift_ajaxHandler method, then overwriting it with a custom method that will lock/unlock based on the Lift-generated UID. If the call is locked, we will prevent more calls of the same type from being submitting. If the call is not locked, we proceed as normal.

We also hijack the theSuccess and theFailure callbacks to do the unlocking, but otherwise they will behave normally.

Usage:

1. Import locker.js in your Lift page (preferably in the head)
2. Assign a special class to the element that will invoke your AJAX request.
 
  a. l_callOnce - Allows one instance of that AJAX call to be invoked once

  b. l_callAndWait - Allows one instance of that AJAX request to be sent at one time. It waits for that call to return, then allows another call.

Requirements:

1. jQuery
2. Lift

License:

Licensed under the <b>Apache 2.0 license</b>.

Credits:

Created by Peter Coons for <a href="http://www.audaxhealth.com">Audax Health</a>
