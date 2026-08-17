import React from "react"

export default function PrivacyPolicyContent() {
  return (
    <div className="font-poppins text-[12px] lg:text-[16px] text-justify bg-white p-8 rounded-xl shadow-lg border border-gray-200 space-y-6 text-gray-800 leading-relaxed">
      {/* Effective Dates */}
      <div className="text-center border-b border-gray-100 pb-4 mb-6">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          Effective Date: 23 JUL 2026 | Last Updated: 23 JUL 2026
        </p>
      </div>

      {/* SECTION I: INTRODUCTION & DEFINITIONS */}
      <div className="space-y-6">
        <h3 className="text-center font-bold text-[#243460] border-y border-gray-200 py-2 text-[14px] lg:text-[16px] uppercase tracking-widest bg-gray-50/50 rounded-lg">
          Section I - Introduction &amp; Definitions
        </h3>

        {/* 1. Introduction */}
        <div>
          <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">1. Introduction</h4>
          <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
            <p>
              Aatrangi Private Limited (the &quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the Hey Attrangi platform (the &quot;Platform&quot;), an AI-assisted mental wellness platform providing emotional wellbeing support, therapist consultations, and related services.
            </p>
            <p>
              This Privacy Policy (this &quot;Policy&quot;) describes how we collect, use, process, store, share, and protect the personal information of individuals who visit our website, use our web application, mobile applications (Android and iOS), or otherwise interact with our Platform and Services.
            </p>
            <p>
              We process personal data only for lawful, specific, and necessary purposes, and implement appropriate safeguards to protect your information under the Digital Personal Data Protection Act, 2023 (the &quot;DPDP Act&quot;), the Mental Healthcare Act, 2017, and other applicable laws of the Republic of India.
            </p>
          </div>
        </div>

        {/* 2. Scope */}
        <div>
          <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">2. Scope</h4>
          <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
            <p>This Policy applies to all individuals who interact with the Platform, including:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Users:</strong> Individuals who register on, access, or use the Platform.</li>
              <li><strong>Patients:</strong> Users who receive therapist-led clinical or therapeutic services.</li>
              <li><strong>Caregivers:</strong> Parents/guardians who manage accounts for Minor Users.</li>
              <li><strong>Therapists:</strong> Licensed mental health professionals providing services.</li>
              <li><strong>Institutional Administrators:</strong> Representatives of partner organizations/schools.</li>
            </ul>
            <p>It covers all current and future offerings operated under the Hey Attrangi brand (websites, Android/iOS apps, portals, dashboards, and APIs).</p>
          </div>
        </div>

        {/* 3. Definitions */}
        <div>
          <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">3. Definitions</h4>
          <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
            <ul className="space-y-2 text-sm">
              <li><strong>&quot;Personal Data&quot;:</strong> Any data about an individual who is identifiable by or in relation to such data, as defined under the DPDP Act.</li>
              <li><strong>&quot;Sensitive Personal Data&quot;:</strong> Data that may pose a higher risk of harm if compromised (e.g. mental health history, health records).</li>
              <li><strong>&quot;Data Principal&quot;:</strong> The individual to whom the personal data relates.</li>
              <li><strong>&quot;Data Fiduciary&quot;:</strong> The Company, which determines the purpose and means of processing personal data.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* SECTION II: INFORMATION WE COLLECT */}
      <div className="space-y-6 pt-6">
        <h3 className="text-center font-bold text-[#243460] border-y border-gray-200 py-2 text-[14px] lg:text-[16px] uppercase tracking-widest bg-gray-50/50 rounded-lg">
          Section II - Information We Collect &amp; How We Use It
        </h3>

        {/* 4. Information We Collect */}
        <div>
          <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">4. Information We Collect</h4>
          <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-3">
            <p>We collect information provided directly by you, automatically through use, or from third-parties:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Details:</strong> Name, phone, email, date of birth, preferences. Google Sign-In, phone OTP, or institutional SSO.</li>
              <li><strong>Caregiver Information:</strong> Consents, government IDs (where required), and relationship info for Minors.</li>
              <li><strong>Health Information:</strong> Mood logs, journal entries, psychological assessments, medication schedules, audio recordings/transcripts of therapy, and AI conversation histories.</li>
              <li><strong>Clinical Info:</strong> Documentation created by Licensed Therapists (treatment plans, diagnostic impressions, progress notes).</li>
              <li><strong>Automatic Analytics:</strong> Click/tap/scroll behaviors, system error logs, device identifiers, IP addresses, and geolocation data.</li>
            </ul>
          </div>
        </div>

        {/* 5. How We Use Information */}
        <div>
          <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">5. How We Use Information</h4>
          <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
            <p>We process your personal data under the consent obtained or legitimate uses (Section 7 of the DPDP Act) for:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Delivering services, video consultations, and maintaining conversation context.</li>
              <li>Powering conversational AI wellness features and crisis detection triggers.</li>
              <li>Fulfilling legal compliance, research benchmarking, and product optimization.</li>
              <li>Preventing fraud, safeguarding user safety, and maintaining system logs.</li>
            </ul>
          </div>
        </div>

        {/* 6. AI Processing */}
        <div>
          <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">6. AI Processing &amp; Limitations</h4>
          <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
            <p>The Platform uses artificial intelligence technologies (proprietary and third-party) to assist with wellness suggestions. <strong>The AI System is not a doctor, psychologist, or psychiatrist and does not diagnose, prescribe, or make clinical decisions.</strong> It is a supportive tool designed to complement human-led care.</p>
          </div>
        </div>
      </div>

      {/* SECTION III: DISCLOSURE & SHARING OF DATA */}
      <div className="space-y-6 pt-6">
        <h3 className="text-center font-bold text-[#243460] border-y border-gray-200 py-2 text-[14px] lg:text-[16px] uppercase tracking-widest bg-gray-50/50 rounded-lg">
          Section III - Information Sharing &amp; Privacy Protections
        </h3>

        {/* 7. Information Sharing */}
        <div>
          <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">7. Data Disclosures</h4>
          <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
            <p>We do not sell individual data. We share details only under strict guidelines:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Therapists:</strong> Shared with your assigned therapist to support clinical care.</li>
              <li><strong>Caregivers:</strong> Clinical progress updates and notifications shared for Minor Users.</li>
              <li><strong>Emergency:</strong> Contact details, location, and nature of threat shared with emergency services or designated contacts.</li>
              <li><strong>Service Providers:</strong> Cloud hosting, secure video streams, SMS platforms, and payment processors bound by strong confidentiality contracts.</li>
            </ul>
          </div>
        </div>

        {/* 8. Institutional Privacy */}
        <div>
          <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">8. Institutional Privacy Guarantee</h4>
          <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2 bg-teal-50/20 p-4 rounded-xl">
            <p><strong>Partner institutions (schools, universities, employers) DO NOT receive:</strong></p>
            <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600">
              <li>Your individual chat conversations with the AI or human therapists.</li>
              <li>Your personal mood tracker logs, journal entries, or assessment scores.</li>
              <li>Any information that can identify you individually in relation to your mental health.</li>
            </ul>
            <p className="mt-2 text-xs font-semibold">Institutions only receive de-identified, aggregated statistical summaries regarding overall population engagement.</p>
          </div>
        </div>
      </div>

      {/* SECTION IV: USER RIGHTS, RETENTION & SECURITY */}
      <div className="space-y-6 pt-6">
        <h3 className="text-center font-bold text-[#243460] border-y border-gray-200 py-2 text-[14px] lg:text-[16px] uppercase tracking-widest bg-gray-50/50 rounded-lg">
          Section IV - Rights, Security &amp; Data Deletion
        </h3>

        {/* 9. Cookies */}
        <div>
          <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">9. Cookies &amp; Tracking</h4>
          <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-1">
            <p>We use essential cookies for platform security, functional cookies to remember settings, and analytics cookies to optimize performance. You can manage your preferences through browser configurations.</p>
          </div>
        </div>

        {/* 10. User Rights */}
        <div>
          <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">10. Your Rights as a Data Principal</h4>
          <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
            <p>Under the DPDP Act, you possess the rights to access, correct, update, and request erasure of your data, withdraw consent easily, nominate a representative, and seek redressal for grievances.</p>
            <p>To exercise these rights, email: <span className="font-bold text-[#3d838c]">support@heyattrangi.com</span>.</p>
          </div>
        </div>

        {/* 11 & 12. Account Deletion & AI Memory */}
        <div>
          <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">11. Account Deletion &amp; AI Memory Clear</h4>
          <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
            <p>Upon requesting deletion, we deactivate your account. AI conversational memory and chat history are wiped. However, clinical record notes must be legally retained in accordance with Section 25 of the Mental Healthcare Act, 2017.</p>
          </div>
        </div>

        {/* 13 & 14. Security & Breaches */}
        <div>
          <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">12. Security Controls &amp; Incident Actions</h4>
          <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
            <p>Data is secured using transit and rest encryption, role-based controls, audits, and multi-factor logins. In the event of a breach, we act immediately to contain, mitigate, notify affected users, and alert the Data Protection Board of India where required by law.</p>
          </div>
        </div>

        {/* 15 to 17. International, Retention & Minor consent */}
        <div>
          <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">13. Data Governance</h4>
          <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
            <p>• <strong>Data Localization:</strong> Processing takes place within India. Cross-border transfers adhere to central notifications.</p>
            <p>• <strong>Retention:</strong> Retained only as long as needed for operational purposes and legal storage rules.</p>
            <p>• <strong>Minor Privacy:</strong> Verifiable caregiver consent is mandatory under the DPDP Act for users under 18 years.</p>
          </div>
        </div>

        {/* 18 & 19. Changes & Contact */}
        <div>
          <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">14. Grievances &amp; Contacts</h4>
          <div className="pl-6 border-l-4 border-gray-300 space-y-2">
            <p className="font-semibold text-gray-900">For issues, queries, or notices:</p>
            <div className="pl-6 border-l-4 border-gray-200 text-gray-700">
              Email: <span className="font-bold text-[#3d838c]">support@heyattrangi.com</span><br />
              Website: <span className="font-bold text-[#3d838c]">www.heyattrangi.com</span><br />
              Grievances: Right to approach the Data Protection Board of India if issues remain unresolved.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
