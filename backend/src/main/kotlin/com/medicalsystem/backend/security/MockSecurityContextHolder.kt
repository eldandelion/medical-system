package com.medicalsystem.backend.security

import com.medicalsystem.backend.model.User

class MockSecurityContext {
    var user: User? = null
}

object MockSecurityContextHolder {
    private val contextHolder = ThreadLocal<MockSecurityContext>()

    fun getContext(): MockSecurityContext {
        var ctx = contextHolder.get()
        if (ctx == null) {
            ctx = MockSecurityContext()
            contextHolder.set(ctx)
        }
        return ctx
    }

    fun setContext(context: MockSecurityContext) {
        contextHolder.set(context)
    }

    fun clearContext() {
        contextHolder.remove()
    }
}
