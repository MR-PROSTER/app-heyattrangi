"use client"

import ProfileCard from "../ui/ProfileCard"
import ProfileHeader from "../ui/ProfileHeader"
import { PROFILE_STACK } from "../ui/profileChrome"
import SignOutCard from "./SignOutCard"
import DeleteAccountCard from "./DeleteAccountCard"

export default function AccountActionsCard() {
  return (
    <ProfileCard id="account" aria-labelledby="account-heading">
      <div className={PROFILE_STACK}>
        <ProfileHeader
          titleId="account-heading"
          title="Account"
          description="Manage your account and sign-in session."
          className="!mb-0"
        />

        <div className="grid grid-cols-1 gap-4">
          <SignOutCard />
          <DeleteAccountCard />
        </div>
      </div>
    </ProfileCard>
  )
}
