package com.medicalsystem.backend.model

/**
 * Pure domain blacklist of disposable and temporary email domains.
 * Prevents disposable email providers from bypassing verification and polluting accounts.
 */
object DisposableEmailBlacklist {
    private val BLACKLIST: Set<String> = setOf(
        "mailinator.com",
        "tempmail.com",
        "temp-mail.org",
        "guerrillamail.com",
        "guerrillamail.net",
        "guerrillamail.org",
        "10minutemail.com",
        "10minutemail.net",
        "yopmail.com",
        "yopmail.net",
        "trashmail.com",
        "sharklasers.com",
        "getairmail.com",
        "dispostable.com",
        "mohmal.com",
        "fakemailgenerator.com",
        "throwawaymail.com",
        "maildrop.cc",
        "inboxkitten.com",
        "crazymailing.com",
        "tempinbox.com",
        "mailcatch.com",
        "trashmail.net",
        "mintemail.com",
        "mytemp.email"
    )

    fun isDisposable(email: String?): Boolean {
        if (email.isNullOrBlank() || !email.contains("@")) return false
        val domain = email.substringAfterLast("@").trim().lowercase()
        return BLACKLIST.contains(domain)
    }
}
