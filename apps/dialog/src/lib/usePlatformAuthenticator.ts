import * as React from 'react'

/**
 * Hook to check if a user-verifying platform authenticator is available.
 * This detects support for passkeys via Touch ID, Face ID, Windows Hello, etc.
 *
 * @returns `true` if available, `false` if not, `undefined` while checking
 */
export function usePlatformAuthenticator(): boolean | undefined {
  const [isAvailable, setIsAvailable] = React.useState<boolean | undefined>(
    undefined,
  )

  React.useEffect(() => {
    async function check() {
      if (
        typeof PublicKeyCredential !== 'undefined' &&
        typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable ===
          'function'
      ) {
        const available =
          await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        setIsAvailable(available)
      } else {
        setIsAvailable(false)
      }
    }
    check().catch(() => {
      setIsAvailable(false)
    })
  }, [])

  return isAvailable
}
