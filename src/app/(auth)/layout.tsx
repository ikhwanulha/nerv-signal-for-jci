"use client"

import { motion } from "framer-motion"
import styles from "./layout.module.scss"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={styles.authLayout}>
      <div className={styles.backgroundGrid} />
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className={styles.logo}>
          <div className={styles.logoIcon}>⟠</div>
          <div className={styles.logoText}>nerv signal</div>
          <div className={styles.logoSub}>JCI Terminal</div>
        </div>
        {children}
      </motion.div>
    </div>
  )
}
