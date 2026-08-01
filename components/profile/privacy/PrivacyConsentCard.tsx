"use client"

import { useMemo } from "react"
import ProfileCard from "../ui/ProfileCard"
import ProfileDivider from "../ui/ProfileDivider"
import ProfileHeader from "../ui/ProfileHeader"
import { PROFILE_STACK, PROFILE_SUBHEAD } from "../ui/profileChrome"
import ConsentRow from "./ConsentRow"
import DataUsageCard from "./DataUsageCard"
import LegalLinks from "./LegalLinks"
import { useProfile } from "../ProfileProvider"
import {
  ACCOUNT_DATA_ROWS,
  buildConsentRecords,
} from "./privacyUtils"

export default function PrivacyConsentCard() {
  const { user, hasPatient } = useProfile()

  const consents = useMemo(
    () =>
      buildConsentRecords({
        hasPatient,
        patientCreatedAt: user.patient?.createdAt,
        userCreatedAt: user.createdAt,
      }),
    [hasPatient, user.patient?.createdAt, user.createdAt]
  )

  return (
    <ProfileCard id="privacy" aria-labelledby="privacy-heading">
      <div className={PROFILE_STACK}>
        <ProfileHeader
          titleId="privacy-heading"
          title="Privacy & Consent"
          description="View the agreements you've accepted and learn how your data is used."
          className="!mb-0"
        />

        <section aria-label="Accepted consents" className="space-y-3">
          {consents.map((record) => (
            <ConsentRow key={record.id} record={record} />
          ))}
        </section>

        <LegalLinks />

        <DataUsageCard />

        <ProfileDivider className="!my-1" />

        <section aria-labelledby="account-data-heading">
          <h3 id="account-data-heading" className={`${PROFILE_SUBHEAD} mb-1`}>
            Account Data
          </h3>
          <p className="text-xs font-medium text-gray-500 mb-4">
            Categories of information connected to your Attrangi account.
          </p>

          <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-100 overflow-hidden bg-white">
            {ACCOUNT_DATA_ROWS.map((row) => (
              <li
                key={row.id}
                className="px-4 sm:px-5 py-3.5 transition-colors duration-150 hover:bg-gray-50/80"
              >
                <p className="text-sm font-semibold text-gray-900">{row.label}</p>
                <p className="mt-0.5 text-xs font-medium text-gray-500 leading-relaxed">
                  {row.hint}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </ProfileCard>
  )
}
