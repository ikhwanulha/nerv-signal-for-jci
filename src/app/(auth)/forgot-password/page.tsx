"use client"

import { useState, FormEvent, useCallback } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import styles from "./forgot.module.scss"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldError, setFieldError] = useState<string | undefined>()

  const validate = useCallback(() => {
    if (!email) {
      setFieldError("Email is required")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError("Invalid email format")
      return false
    }
    return true
  }, [email])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldError(undefined)
    if (!validate()) return

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      })

      // Always show success to prevent email enumeration
      setSubmitted(true)
    } catch {
      setSubmitted(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
    >
      {submitted ? (
        <div className={styles.successContainer}>
          <div className={styles.successIcon}>✉</div>
          <p className={styles.successTitle}>Check your email</p>
          <p className={styles.successMessage}>
            If an account exists with that email address, we&apos;ve sent
            instructions to reset your password.
          </p>
          <div className={styles.links} style={{ marginTop: "1.5rem" }}>
            <Link href="/login" className={styles.link}>
              Kembali ke login
            </Link>
          </div>
        </div>
      ) : (
        <>
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <p className={styles.title}>Reset Password</p>
            <p className={styles.subtitle}>
              Enter your email and we&apos;ll send you reset instructions.
            </p>

            {error && (
              <div className={styles.fieldError} style={{ textAlign: "center" }}>
                {error}
              </div>
            )}

            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className={`${styles.input} ${fieldError ? styles.inputError : ""}`}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setFieldError(undefined)
                }}
                autoComplete="email"
                disabled={isLoading}
              />
              {fieldError && (
                <span className={styles.fieldError}>{fieldError}</span>
              )}
            </div>

            <button
              className={styles.submitButton}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner} />
                  Sending...
                </>
              ) : (
                "Send Reset Instructions"
              )}
            </button>
          </form>

          <div className={styles.links}>
            <Link href="/login" className={styles.link}>
              Kembali ke login
            </Link>
          </div>
        </>
      )}
    </motion.div>
  )
}
