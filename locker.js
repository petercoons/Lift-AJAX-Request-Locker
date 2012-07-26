/**
 * Invoke the AjaxLocker only if the Lift Ajax Handler is loaded.
 */
$('document').ready( function() {
    try {
        if (liftAjax.lift_ajaxHandler !== undefined) {
            LiftAjaxLocker.init();
        }
    }
    catch(e) {
        // Do nothing
    }
});

/**
 * This creates a locking mechanism specifically for use with Lift Ajax calls.
 *
 * Every time we invoke the Lift AJAX handler, we will add the call to the locker to prevent multiple requests going to
 * the server.
 *
 * TO USE: Simply add one of the following classes on to the item that will call the AJAX handler.
 *  - l_callOnce: Make the ajax request one time only (useful for forms or other posts)
 *  - l_callAndWait: Lock the request until it returns, then unlock it. *This should be used for most things*
 */
(function(LiftAjaxLocker) {

    LiftAjaxLocker.locker = {};

    LiftAjaxLocker.isLocked = function(uid) {
        if ( this.locker[uid] === true ) {
            return true;
        }
        return false;
    };

    LiftAjaxLocker.lock = function(ajaxUid) {
        if (this.isLocked(ajaxUid)) {
            return 0;
        }
        this.locker[ajaxUid] = true;
        return 1;
    };

    LiftAjaxLocker.unlock = function(ajaxUid) {
        if (!this.isLocked(ajaxUid)) {
            return 0;
        }
        this.locker[ajaxUid] = false;
        return 1;
    };

    /**
     * Set up the locker
     */
    LiftAjaxLocker.init = function() {

        var _this = this;

        // We will backup the original ajaxHandler method so that we can insert our own method into the reference.
        this._lift_ajaxHandler = liftAjax.lift_ajaxHandler;

        liftAjax.lift_ajaxHandler = function(theData, theSuccess, theFailure, responseType) {
            if (_this.isLocked(theData)) {
                return;
            }

            /**
             * Checks the target and the source element for a certain class.
             * We specify both the target and source to cover SHtml.a
             * IE / FF / Chrome safe
             */
            function targetsHaveClass(whichClass) {
                var target, event, source = null;
                try {
                    if (window.event !== undefined) {
                        event = window.event;
                    }
                    else {
                        event = arguments.callee.caller.caller.arguments[0];
                    }
                }
                catch(e) {
                    event = arguments.callee.caller.caller.arguments[0];
                }

                try {
                    if (event.srcElement !== undefined) {
                        source = event.srcElement;
                    }
                    else {
                        source = event.target;
                    }
                }
                catch(e) {
                    source = event.target;
                }

                target = event.currentTarget;

                if ( jQuery(target).hasClass(whichClass) || jQuery(source).hasClass(whichClass) ) {
                    return true;
                }
                return false;
            }

            /**
             * Rules for different types of locks go here:
             */

            /**
             * callAndWait
             */
            if ( targetsHaveClass('l_callAndWait') ) {
                var __theSuccess = theSuccess;
                var __theFailure = theFailure;
                _this.lock(theData);
                theSuccess = function() {
                    _this.unlock(theData);
                    __theSuccess();
                };
                theFailure = function() {
                    _this.unlock(theData);
                    __theFailure();
                };
            }

            /**
             * callOnce
             */
            else if( targetsHaveClass('l_callOnce') ) {
                _this.lock(theData);
            }

            // Make the initial AJAX request
            _this._lift_ajaxHandler(theData, theSuccess, theFailure, responseType);
        };
    };
})
(window.LiftAjaxLocker = window.LiftAjaxLocker || {});