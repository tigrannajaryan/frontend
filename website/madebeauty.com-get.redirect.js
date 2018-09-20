<script type="text/javascript">
// Note: this code is added as a Raw JS at the bottom of
// page https://www2.madebeauty.com/wp-admin/post.php?post=75352&action=edit

/**
 * Determine the mobile operating system.
 * This function returns one of 'iOS', 'Android', 'Windows Phone', or 'unknown'.
 *
 * @returns {String}
 */
function getMobileOperatingSystem() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
    // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
        return "Windows Phone";
    }

    if (/android/i.test(userAgent)) {
        return "Android";
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "iOS";
    }

    return "unknown";
}

window.onload = function() {
    var mobileOs = getMobileOperatingSystem();
    if (mobileOs=="Android") {
        window.location.replace("https://play.google.com/store/apps/details?id=com.madebeauty.client.prod");
    } else if (mobileOs=="iOS") {
        window.location.replace("https://itunes.apple.com/us/app/madebeauty/id1410170290");
    }
}
</script>