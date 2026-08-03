import type { ReactNode } from "react"

/**
 * Full Terms & Conditions body — shared by onboarding modal and /terms page.
 * Visual language matches the existing Hey Attrangi legal modal.
 */

const PART =
  "text-center font-bold text-[#243460] border-y border-gray-200 py-2 text-[14px] lg:text-[16px] uppercase tracking-widest bg-gray-50/50 rounded-lg"

const H =
  "font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]"

const BODY =
  "pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 text-justify space-y-2"

const LINK = "font-bold text-[#3d838c] hover:underline"

function Section({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div>
      <h4 className={H}>{title}</h4>
      <div className={BODY}>{children}</div>
    </div>
  )
}

export default function TermsAndConditionsContent() {
  return (
    <div className="font-poppins text-[12px] lg:text-[16px] text-justify bg-white p-8 rounded-xl shadow-lg border border-gray-200 space-y-6 text-gray-800 leading-relaxed">
      <div className="text-center border-b border-gray-100 pb-4 mb-6">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          Effective Date: 23 JUL 2026 | Last Updated: 23 JUL 2026
        </p>
      </div>

      {/* PART I */}
      <div className="space-y-6">
        <h3 className={PART}>Part I — Introduction &amp; Foundational Terms</h3>

        <Section title="1. Introduction">
          <p>
            Welcome to Hey Attrangi. These Terms &amp; Conditions (&quot;Terms&quot;) form a legally
            binding agreement between you (&quot;you&quot;, &quot;your&quot;, or &quot;User&quot;) and Aatrangi Private
            Limited (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) regarding your access to and use of the
            Hey Attrangi platform (the &quot;Platform&quot;).
          </p>
          <p>
            The Platform includes all websites, web applications, mobile applications, therapist
            portals, administrative dashboards, institutional dashboards, application programming
            interfaces (APIs), and any future products, modules, and official services we develop.
          </p>
          <p>
            By accessing or using the Platform, you acknowledge that you have read, understood, and
            agree to be bound by these Terms. If you do not agree to these Terms, you must not
            access or use the Platform.
          </p>
          <p className="text-xs text-gray-500 italic">
            These Terms are published in compliance with the Information Technology Act, 2000, the
            Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules,
            2021, and other applicable laws of the Republic of India.
          </p>
        </Section>

        <Section title="2. Scope">
          <p>These Terms apply to all Users of the Platform, including:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Users who access AI-assisted wellness features</li>
            <li>Patients who receive therapist-led clinical or therapeutic services</li>
            <li>Caregivers who create and manage accounts for Minor Users</li>
            <li>Licensed Therapists who provide Services through the Platform</li>
            <li>Institutional Administrators representing partner institutions</li>
            <li>Any other individual or entity accessing or using the Platform</li>
          </ul>
          <p>
            These Terms apply to all products, services, websites, applications, and platforms
            operated under the Hey Attrangi brand, including all current and future offerings.
          </p>
        </Section>

        <Section title="3. Relationship with Other Documents">
          <p>
            These Terms should be read together with the following documents, which together form
            the complete legal framework governing your use of the Platform:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-semibold text-gray-600 bg-gray-50 p-4 rounded-xl">
            <div>• General Treatment Consent — Governs consent to mental wellness and therapeutic services</div>
            <div>• AI Assistance Consent — Governs consent to artificial intelligence features</div>
            <div>• Teletherapy Consent — Governs consent to therapist-led teletherapy</div>
            <div>• Session Recording Consent — Governs recording of therapy sessions</div>
            <div>• Emergency Contact Authorization — Authorizes contact of designated Emergency Contacts</div>
            <div>• Crisis Intervention Consent — Governs crisis detection and intervention</div>
            <div>• Data Processing Consent — Governs processing of your data</div>
            <div>• Electronic Communication Consent — Governs electronic communications</div>
            <div>• Privacy Policy — Governs collection, processing, storage, and disclosure of personal data</div>
            <div>• Data Retention &amp; Deletion Policy — Governs retention and deletion of your data</div>
          </div>
          <p>
            <strong>Document Hierarchy:</strong> In the event of any conflict between these Terms and
            any other document:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>Applicable law shall prevail over all documents</li>
            <li>
              The General Treatment Consent shall prevail over these Terms with respect to
              therapist-led clinical services
            </li>
            <li>
              The AI Assistance Consent shall prevail over these Terms with respect to AI-specific
              provisions
            </li>
            <li>
              These Terms shall prevail over the Privacy Policy and Data Retention &amp; Deletion
              Policy with respect to contractual terms
            </li>
          </ul>
        </Section>

        <Section title="4. Definitions">
          <ul className="space-y-2 text-sm">
            <li>
              <strong>&quot;Platform&quot;</strong> means the digital mental health platform operated by the
              Company under the brand name &quot;Hey Attrangi&quot;, including all websites, web applications,
              mobile applications, therapist portals, administrative dashboards, institutional
              dashboards, APIs, and future products, modules, and official services developed by the
              Company.
            </li>
            <li>
              <strong>&quot;Services&quot;</strong> means the mental wellness and therapeutic services provided
              through the Platform, including AI-assisted wellness features, therapist consultations,
              video consultations, mood tracking, journaling, assessments, medication reminders,
              wellness activities, and related services.
            </li>
            <li>
              <strong>&quot;User&quot;</strong> means any individual who registers on, accesses, or uses any
              feature of the Platform.
            </li>
            <li>
              <strong>&quot;Patient&quot;</strong> means a User who receives therapist-led clinical or
              therapeutic services through the Platform.
            </li>
            <li>
              <strong>&quot;Minor&quot;</strong> or <strong>&quot;Minor User&quot;</strong> means a User who is below the
              age of eighteen (18) years.
            </li>
            <li>
              <strong>&quot;Caregiver&quot;</strong> means a parent or legal guardian who creates and manages an
              account for a Minor User.
            </li>
            <li>
              <strong>&quot;Licensed Therapist&quot;</strong> means a mental health professional who holds a
              valid license to practice mental healthcare and provides Services through the Platform.
            </li>
            <li>
              <strong>&quot;AI System&quot;</strong> means the artificial intelligence-powered components of the
              Platform, including the conversational chatbot, mood analysis algorithms, AI-generated
              recommendations, wellness plans, psychological screening tools, medication reminders,
              crisis detection algorithms, and report generation tools.
            </li>
            <li>
              <strong>&quot;User Content&quot;</strong> means any content, information, data, text, graphics,
              images, audio, or other materials that you submit, post, upload, or otherwise make
              available on or through the Platform.
            </li>
            <li>
              <strong>&quot;Output&quot;</strong> means any content, information, data, text, graphics, images,
              or other materials generated by the AI System in response to your inputs.
            </li>
            <li>
              <strong>&quot;Order Form&quot;</strong> means any ordering document, invoice, or other record that
              specifies the Services you have subscribed to and the applicable fees.
            </li>
            <li>
              <strong>&quot;Subscription Term&quot;</strong> means the period during which you have subscribed to
              access the Services, as specified in the applicable Order Form.
            </li>
            <li>
              <strong>&quot;Voice Input&quot;</strong> means the functionality that allows you to speak to the AI
              Companion using your device&apos;s microphone, with your speech being converted into text by
              a trusted speech recognition service.
            </li>
            <li>
              <strong>&quot;Transcript&quot;</strong> means the text generated from your speech through the speech
              recognition process.
            </li>
          </ul>
        </Section>

        <Section title="5. Amendments">
          <p>
            We reserve the right to amend these Terms at any time, in our sole discretion, subject to
            applicable law. When we make material changes to these Terms, we will notify you through:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>The Platform</li>
            <li>Email to your registered email address</li>
            <li>In-app notifications</li>
            <li>A notice on our website</li>
            <li>Any other appropriate means</li>
          </ul>
          <p>
            The &quot;Effective Date&quot; at the top of these Terms indicates when they were last revised. Your
            continued use of the Platform after the effective date of any changes constitutes your
            acceptance of the updated Terms, subject to any additional consent requirements under
            applicable law.
          </p>
          <p>
            If you do not agree to any amendment, your sole remedy is to cease using the Platform and
            terminate your account.
          </p>
        </Section>

        <Section title="6. Interpretation">
          <p>The following rules apply to the interpretation of these Terms:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Headings are for convenience only and shall not affect interpretation</li>
            <li>Words importing the singular include the plural, and vice versa</li>
            <li>Words importing the masculine gender include the feminine and neuter genders</li>
            <li>&quot;Include&quot; or &quot;including&quot; means &quot;including without limitation&quot;</li>
            <li>
              &quot;Shall&quot; indicates a mandatory requirement; &quot;may&quot; indicates a permissive or discretionary
              action
            </li>
            <li>References to laws include any amendments, re-enactments, or substitutions</li>
            <li>References to documents include any amendments or replacements</li>
          </ul>
        </Section>
      </div>

      {/* PART II */}
      <div className="space-y-6 pt-6">
        <h3 className={PART}>Part II — Eligibility and Accounts</h3>

        <Section title="7. Eligibility">
          <p>The Platform is available to individuals who are at least three (3) years of age.</p>
          <p>
            <strong>Minor Users (Under 18):</strong> Individuals below the age of eighteen (18) years
            may only access the Platform under the following conditions:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>A Caregiver must create and manage the Minor User&apos;s account</li>
            <li>
              The Caregiver must provide verifiable consent for the processing of the Minor User&apos;s
              personal data in accordance with the Digital Personal Data Protection Act, 2023
            </li>
            <li>Therapy sessions with Licensed Therapists must always be managed by the Caregiver</li>
            <li>
              The Minor User may independently access only the AI conversational companion, mood
              tracking, guided journaling, and wellness activities
            </li>
            <li>
              The Caregiver shall be responsible for supervising the Minor User&apos;s use of the Platform,
              including any optional features such as voice input
            </li>
          </ul>
          <p>
            <strong>Your Representations:</strong> By using the Platform, you represent and warrant
            that:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>You are lawfully able to enter into a binding contract</li>
            <li>You are not prohibited from using the Platform under applicable law</li>
            <li>
              If you are accepting these Terms on behalf of an entity, you have the legal authority to
              bind that entity
            </li>
            <li>All information you provide is accurate, complete, and truthful</li>
          </ul>
        </Section>

        <Section title="8. Account Creation and Authentication">
          <p>To access the Services, you must create an account on the Platform.</p>
          <p>
            <strong>Authentication Methods:</strong> You may create an account using one of the
            following methods:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Google Sign-In:</strong> Sign in using your Google account. By doing so, you
              authorize us to receive your name, email address, and profile information from Google.
              We do not receive your Google password.
            </li>
            <li>
              <strong>Phone OTP:</strong> Sign in using your phone number. We will send a one-time
              password (OTP) to your phone for verification.
            </li>
            <li>
              <strong>Institutional Single Sign-On (SSO):</strong> If you access the Platform through
              a partner institution, you may sign in using your institutional credentials.
            </li>
          </ul>
          <p>
            <strong>Future Authentication Methods:</strong> We may introduce additional authentication
            methods from time to time. You are responsible for maintaining the confidentiality of your
            account credentials and for all activities that occur under your account. You must notify
            us immediately of any unauthorized use of your account or any other breach of security.
          </p>
        </Section>

        <Section title="9. Caregiver Accounts">
          <p>
            Caregiver accounts are created and managed by the Caregiver on behalf of a Minor User. The
            Caregiver is the legal account owner for every Minor User account.
          </p>
          <p>
            <strong>Caregiver Responsibilities:</strong> The Caregiver is responsible for:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>All activities carried out on behalf of the Minor User</li>
            <li>All therapy-related decisions involving the Minor User</li>
            <li>Providing accurate and complete information about the Minor User</li>
            <li>Supervising the Minor User&apos;s use of the Platform</li>
            <li>Ensuring that the Minor User accesses only age-appropriate Services</li>
          </ul>
        </Section>

        <Section title="10. Account Security">
          <p>
            <strong>Your Responsibilities:</strong> You are responsible for:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Maintaining the security of your account credentials</li>
            <li>Not sharing your account credentials with unauthorized individuals</li>
            <li>Using strong, unique passwords</li>
            <li>Enabling multi-factor authentication where available</li>
            <li>Logging out of your account after each session</li>
          </ul>
          <p>
            We are not liable for any loss or damage arising from your failure to comply with these
            security obligations.
          </p>
        </Section>

        <Section title="11. Account Verification">
          <p>We may require you to verify your identity at any time, including but not limited to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>During account creation</li>
            <li>Before accessing therapist-led services</li>
            <li>Before updating sensitive account information</li>
            <li>In response to security concerns</li>
            <li>As required by applicable law</li>
          </ul>
          <p>
            Verification may include providing government-issued identification, confirming contact
            information, or other reasonable verification methods.
          </p>
        </Section>
      </div>

      {/* PART III */}
      <div className="space-y-6 pt-6">
        <h3 className={PART}>Part III — Platform Services</h3>

        <Section title="12. Services Overview">
          <p>The Platform provides the following Services:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>AI Wellness:</strong> AI-powered conversational wellness support, personalized
              recommendations, wellness plans, and related features. You may interact with the AI
              Companion either by typing text or by using voice input, as described in these Terms.
            </li>
            <li>
              <strong>Therapy:</strong> Therapist-led consultations conducted through secure video
              consultations
            </li>
            <li>
              <strong>Mood Tracking:</strong> Tools to record, monitor, and track emotional states
            </li>
            <li>
              <strong>Journaling:</strong> Guided and free-form journaling exercises
            </li>
            <li>
              <strong>Assessments:</strong> Psychological screening assessments
            </li>
            <li>
              <strong>Medication Reminders:</strong> Notifications to support medication adherence
            </li>
            <li>
              <strong>Wellness Activities:</strong> Exercises and activities to promote mental health
            </li>
            <li>
              <strong>Institutional Services:</strong> Services for partner institutions, including
              aggregated analytics and institutional dashboards
            </li>
            <li>
              <strong>Administrative Dashboards:</strong> Dashboards for administrative management of
              the Platform
            </li>
            <li>
              <strong>Future Products:</strong> Any additional products, modules, or services developed
              by the Company
            </li>
          </ul>
          <p>
            <strong>What the Platform Does Not Provide:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Emergency medical services</li>
            <li>Psychiatric diagnosis through AI</li>
            <li>Voice calling or AI-generated spoken responses</li>
            <li>Direct messaging between Users</li>
          </ul>
        </Section>

        <Section title="13. Service Availability">
          <p>
            We aim to provide continuous availability of the Platform but do not guarantee
            uninterrupted, error-free, or always-available services. The Platform may be unavailable
            due to:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Scheduled maintenance</li>
            <li>Unscheduled maintenance or emergency repairs</li>
            <li>Technical failures or system upgrades</li>
            <li>Third-party service provider outages</li>
            <li>Force Majeure events</li>
            <li>Any other circumstances beyond our reasonable control</li>
          </ul>
          <p>We will make reasonable efforts to provide advance notice of scheduled maintenance.</p>
        </Section>

        <Section title="14. Beta Features">
          <p>
            We may offer beta or experimental features (&quot;Beta Features&quot;) from time to time. Beta
            Features:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>May change at any time without notice</li>
            <li>May contain defects, errors, or bugs</li>
            <li>May be discontinued at any time</li>
            <li>May not be fully supported</li>
            <li>Are provided &quot;as is&quot; without warranties of any kind</li>
          </ul>
          <p>Your use of Beta Features is at your own risk.</p>
        </Section>

        <Section title="15. Modifications to Services">
          <p>
            We reserve the right to modify, suspend, or discontinue any Service at any time, with or
            without notice. We may:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Add new features or functionalities</li>
            <li>Remove existing features or functionalities</li>
            <li>Change the pricing of Services</li>
            <li>Change the availability of Services in different geographic regions</li>
            <li>Make any other changes to the Services in our sole discretion</li>
          </ul>
          <p>We shall not be liable for any modifications, suspensions, or discontinuations of Services.</p>
        </Section>

        <Section title="16. Third-Party Services">
          <p>
            The Platform may integrate with or provide access to third-party services, applications, or
            content (&quot;Third-Party Services&quot;). Third-Party Services are provided &quot;as is&quot; and &quot;as
            available&quot; without warranties of any kind. We do not endorse, control, or assume
            responsibility for any Third-Party Services. Your use of Third-Party Services is governed
            by the terms and conditions of the applicable third-party provider.
          </p>
        </Section>
      </div>

      {/* PART IV */}
      <div className="space-y-6 pt-6">
        <h3 className={PART}>Part IV — AI Services</h3>

        <Section title="17. AI Services">
          <p>
            The Platform incorporates artificial intelligence technologies to provide AI-assisted mental
            wellness services. The AI System may utilize AI technologies developed internally by the
            Company and/or provided by trusted third-party service providers operating under appropriate
            contractual, privacy, confidentiality, and security obligations.
          </p>
          <p>
            The specific AI technologies utilized by the Platform may change over time without requiring
            amendment of these Terms, provided that the overall purposes and material characteristics of
            the AI System remain substantially similar.
          </p>
          <p>
            For more information on AI services, please refer to our AI Assistance Consent document.
          </p>
        </Section>

        <Section title="18. AI Limitations">
          <p>You acknowledge and understand that the AI System:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Is not a psychologist, psychiatrist, therapist, physician, or healthcare practitioner</li>
            <li>Does not independently diagnose any medical or psychological condition</li>
            <li>Does not prescribe medication</li>
            <li>
              Does not replace licensed mental healthcare professionals, clinical judgment, or
              therapeutic intervention
            </li>
            <li>
              Does not make clinical decisions, which remain solely with Licensed Therapists and other
              qualified mental health professionals
            </li>
            <li>
              Is a supportive tool designed to complement, not replace, professional mental healthcare
            </li>
          </ul>
          <p>
            The AI System may generate responses that are inaccurate, incomplete, or inappropriate. You
            should exercise independent judgment and not rely exclusively on the AI System. For more
            information on AI limitations, please refer to our AI Assistance Consent document.
          </p>
        </Section>

        <Section title="19. AI Memory">
          <p>
            The AI System maintains memory of previous conversations and interactions to provide
            continuity of care and personalized experiences. You may request deletion of AI memory where
            legally and operationally feasible. For more information on AI memory, please refer to our AI
            Assistance Consent and Privacy Policy.
          </p>
        </Section>

        <Section title="20. AI Crisis Detection">
          <p>
            The AI System includes crisis detection capabilities designed to identify potential
            indicators of crisis situations.
          </p>
          <p className="font-semibold text-red-700 bg-red-50 border border-red-100 rounded-xl p-3">
            IMPORTANT: The AI System is not an emergency service and must never be relied upon as the
            sole source of crisis intervention.
          </p>
          <p>
            For more information on crisis detection, please refer to our Crisis Intervention Consent
            document.
          </p>
        </Section>

        <Section title="21. Voice Input">
          <p>
            The Platform offers you the option to provide input to the AI Companion through voice, in
            addition to typed text.
          </p>
          <p>
            <strong>1. Optional Nature.</strong> Voice input is entirely optional. You may continue to
            interact with the AI Companion exclusively through typed text if you so choose. Typing
            remains fully supported at all times.
          </p>
          <p>
            <strong>2. How Voice Input Works.</strong> When you choose to use voice input:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Microphone Permission:</strong> The application requests permission to access your
              device&apos;s microphone only when you choose to use voice input. You may grant or withdraw
              this permission at any time through your device settings.
            </li>
            <li>
              <strong>Speech-to-Text Conversion:</strong> Your speech is converted into text using a
              trusted third-party speech recognition service operating under appropriate contractual
              confidentiality, privacy, and security obligations.
            </li>
            <li>
              <strong>Text-Only Responses:</strong> The AI always responds in text. The AI does not
              generate spoken responses.
            </li>
            <li>
              <strong>Transcript Processing:</strong> The generated transcript is processed by the AI
              Companion in the same manner as a typed message and becomes part of your conversation
              history.
            </li>
          </ul>
          <p>
            <strong>3. Data Retention and Privacy.</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Raw Audio Discarded:</strong> Raw audio recordings are not retained after
              successful transcription. Immediately after your speech has been converted into text, the
              raw audio is securely discarded.
            </li>
            <li>
              <strong>Transcript Retention:</strong> Only the generated transcript is retained as part
              of your conversation history and is subject to the same privacy policies, retention
              policies, and AI safeguards as typed messages.
            </li>
            <li>
              <strong>No Voice Identification:</strong> The AI does not use your voice to identify you.
              The platform does not perform speaker identification, voice authentication, voice
              biometrics, voice profiling, voice cloning, or voiceprint creation.
            </li>
          </ul>
          <p>
            <strong>4. Speech Recognition Limitations.</strong> Speech recognition technology may
            occasionally generate inaccurate words, punctuation, names, accents, or interpretations. You
            remain responsible for reviewing important information before relying upon AI responses.
          </p>
          <p>
            <strong>5. Voice Interactions and AI Safeguards.</strong> Voice conversations are subject to
            the same AI limitations, safety mechanisms, content moderation, crisis detection, and
            disclaimers that apply to typed conversations.
          </p>
          <p>
            <strong>6. User Control.</strong> You may grant or withdraw microphone permission at any
            time through your device&apos;s operating system settings. If microphone permission is denied,
            voice input becomes unavailable while text input continues to function normally.
          </p>
        </Section>
      </div>

      {/* PART V */}
      <div className="space-y-6 pt-6">
        <h3 className={PART}>Part V — Therapist Services</h3>

        <Section title="22. Therapist Services">
          <p>
            Therapy and counselling services on the Platform are delivered exclusively by Licensed
            Therapists who hold valid professional licenses and qualifications. The Platform facilitates
            consultations between Users and Licensed Therapists through secure video conferencing but
            does not itself provide therapeutic services.
          </p>
          <p>
            The Licensed Therapist, not the Company, is responsible for all clinical decisions,
            including diagnosis, treatment planning, and therapeutic interventions. The therapeutic
            relationship is between the User and the Licensed Therapist. The Company is not a party to
            that therapeutic relationship.
          </p>
          <p>
            For more information on therapist services, please refer to our Teletherapy Consent
            document.
          </p>
        </Section>

        <Section title="23. Therapist Relationship">
          <p>
            <strong>We Do Not:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Control, direct, or influence the clinical decisions of Licensed Therapists</li>
            <li>Guarantee the availability of any specific Licensed Therapist</li>
            <li>Guarantee any specific therapeutic outcome or result</li>
            <li>
              Assume responsibility for the quality of therapeutic services provided by Licensed
              Therapists
            </li>
          </ul>
          <p>
            Licensed Therapists are independent professionals and are not employees or agents of the
            Company. We shall not be liable for any acts or omissions of Licensed Therapists.
          </p>
        </Section>

        <div>
          <h4 className="font-bold text-red-600 mb-2 uppercase text-[13px] lg:text-[15px]">
            24. Emergency Services Disclaimer
          </h4>
          <div className="pl-6 border-l-4 border-red-500 text-red-700 bg-red-50 p-4 rounded-xl border border-red-100 text-justify space-y-2">
            <p>
              The Platform is not an emergency response service and does not provide emergency medical
              or psychiatric care. In the event of a mental health emergency, including but not limited
              to suicidal thoughts, self-harm intentions, thoughts of violence, or any medical
              emergency, you shall immediately contact local emergency services by dialing the
              appropriate emergency number or proceed to the nearest hospital emergency department.
            </p>
            <p>
              For more information on emergencies, please refer to our Crisis Intervention Consent and
              Emergency Contact Authorization documents.
            </p>
          </div>
        </div>
      </div>

      {/* PART VI */}
      <div className="space-y-6 pt-6">
        <h3 className={PART}>Part VI — Institutional Services</h3>

        <Section title="25. Institutional Services">
          <p>
            We offer Services to partner institutions, including schools, colleges, universities, and
            other organizations. Institutional Services may include:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Institutional dashboards</li>
            <li>Aggregated analytics and reports</li>
            <li>Institutional Single Sign-On (SSO) integration</li>
            <li>Institutional administrative tools</li>
            <li>Other services as agreed between the Company and the institution</li>
          </ul>
          <p>
            Institutional Services are governed by separate agreements between the Company and the
            institution.
          </p>
        </Section>

        <Section title="26. Institutional Privacy">
          <p>
            <strong>Institutions DO NOT receive:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Therapy conversations or session content</li>
            <li>AI conversation history with the AI Companion</li>
            <li>Journal entries or personal reflections</li>
            <li>Individual clinical records or therapist notes</li>
            <li>Mood logs or assessment responses at an individual level</li>
            <li>Any information that could reasonably identify you as an individual</li>
          </ul>
          <p>
            <strong>Institutions may receive only:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Aggregated analytics and statistical summaries</li>
            <li>Anonymous wellbeing insights</li>
            <li>De-identified institutional dashboard information</li>
          </ul>
          <p>For more information on institutional privacy, please refer to our Privacy Policy.</p>
        </Section>
      </div>

      {/* PART VII */}
      <div className="space-y-6 pt-6">
        <h3 className={PART}>Part VII — Subscriptions and Payments</h3>

        <Section title="27. Subscriptions">
          <p>
            Certain Services may be offered on a subscription basis. The fees, billing frequency, and
            subscription terms shall be specified in the applicable Order Form. Subscriptions may be:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Monthly or annual</li>
            <li>Individual or institutional</li>
            <li>Auto-renewing or non-renewing, as specified in the Order Form</li>
          </ul>
          <p>We reserve the right to change subscription fees upon reasonable notice.</p>
        </Section>

        <Section title="28. Payment Processing">
          <p>
            Payments for Services are processed through secure, third-party payment gateways. We do not
            store complete card or banking credentials on our servers. Payment methods may include
            credit/debit cards, UPI, net banking, and digital wallets, subject to availability. All
            payments are processed in Indian Rupees (INR) unless otherwise specified. You are
            responsible for providing accurate and complete payment information.
          </p>
        </Section>

        <Section title="29. Refunds and Cancellations">
          <p>
            Refunds, cancellations, and billing adjustments are governed by a separate Refund &amp;
            Cancellation Policy and applicable law. Except as required by applicable law or as set forth
            in the Refund &amp; Cancellation Policy, all fees are non-refundable. You may cancel your
            subscription at any time through the Platform or by contacting us. Cancellation will take
            effect at the end of the current billing cycle.
          </p>
        </Section>

        <Section title="30. Taxes">
          <p>
            All fees are exclusive of applicable taxes, including but not limited to Goods and Services
            Tax (GST). You are responsible for all taxes applicable to your subscription and use of the
            Services. We shall issue invoices in accordance with applicable tax laws.
          </p>
        </Section>
      </div>

      {/* PART VIII */}
      <div className="space-y-6 pt-6">
        <h3 className={PART}>Part VIII — User Content</h3>

        <Section title="31. User Content">
          <p>
            &quot;User Content&quot; means any content, information, data, text, graphics, images, audio, or other
            materials that you submit, post, upload, or otherwise make available on or through the
            Platform. User Content includes, but is not limited to:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Journal entries</li>
            <li>Mood logs and tracking data</li>
            <li>Assessment responses</li>
            <li>Uploaded images</li>
            <li>
              AI conversation inputs, including both typed messages and transcripts from voice input
            </li>
            <li>Any other content you create or submit</li>
          </ul>
          <p>You retain ownership of your User Content.</p>
        </Section>

        <Section title="32. License to User Content">
          <p>
            By submitting User Content to the Platform, you grant us a worldwide, royalty-free,
            non-exclusive license to use, reproduce, modify, adapt, store, and distribute your User
            Content solely for the following purposes:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Providing Services through the Platform</li>
            <li>Operating the Platform</li>
            <li>Clinical care and therapy</li>
            <li>AI assistance, including training and improving AI models</li>
            <li>Research, subject to applicable law and consent</li>
            <li>Platform improvement and development</li>
            <li>
              Any other purposes set forth in our Privacy Policy and Data Processing Consent
            </li>
          </ul>
          <p>
            This license is limited to the purposes set forth above and does not grant us the right to
            sell or commercially exploit your User Content outside the scope of the Platform and its
            Services. We shall apply appropriate safeguards to User Content, including de-identification,
            anonymization, aggregation, or pseudonymization where feasible and appropriate.
          </p>
        </Section>

        <Section title="33. User Content Representations">
          <p>You represent and warrant that:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              You own or have the necessary licenses, rights, consents, and permissions to submit your
              User Content
            </li>
            <li>
              Your User Content does not infringe the intellectual property rights, privacy rights, or
              other rights of any third party
            </li>
            <li>
              Your User Content is accurate, complete, and truthful to the best of your knowledge
            </li>
          </ul>
          <p>
            We do not endorse and are not responsible for any User Content. We reserve the right to
            remove or disable access to any User Content that violates these Terms or applicable law.
          </p>
        </Section>
      </div>

      {/* PART IX */}
      <div className="space-y-6 pt-6">
        <h3 className={PART}>Part IX — Intellectual Property</h3>

        <Section title="34. Company Intellectual Property">
          <p>We own all right, title, and interest in and to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>The Platform and its software, applications, and interfaces</li>
            <li>Source code, algorithms, and AI models</li>
            <li>AI Systems and related technologies</li>
            <li>
              Reports generated by the Platform (subject to your rights in your User Content)
            </li>
            <li>The &quot;Hey Attrangi&quot; brand, trademarks, logos, and designs</li>
            <li>Documentation, workflows, and databases</li>
            <li>APIs and related technologies</li>
            <li>Future improvements and derivative works</li>
            <li>All other intellectual property rights in and to the Platform and its Services</li>
          </ul>
          <p>
            All content on the Platform, including text, graphics, logos, icons, images, audio, video,
            and software, is our property or the property of our licensors and is protected by
            intellectual property laws.
          </p>
        </Section>

        <Section title="35. User License">
          <p>
            Subject to your compliance with these Terms, we grant you a limited, non-exclusive,
            non-transferable, revocable license to access and use the Platform and its Services for
            personal, non-commercial purposes.
          </p>
          <p>
            <strong>This License Does Not Include the Right To:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Reproduce, distribute, modify, or create derivative works of the Platform or its content</li>
            <li>Use the Platform for commercial purposes without our prior written consent</li>
            <li>Reverse engineer, decompile, or disassemble the Platform</li>
            <li>Remove or alter any proprietary notices</li>
            <li>Use the Platform in any manner that violates these Terms or applicable law</li>
          </ul>
          <p>
            This license is effective until terminated. The license terminates automatically upon
            termination of your account or violation of these Terms.
          </p>
        </Section>

        <Section title="36. Trademarks">
          <p>
            &quot;Hey Attrangi&quot; and our logos, product names, and service names are trademarks of the Company.
            You may not use any of our trademarks without our prior written consent. All other
            trademarks, service marks, and trade names appearing on the Platform are the property of
            their respective owners.
          </p>
        </Section>

        <Section title="37. Open Source">
          <p>
            Certain software components used in the Platform may be distributed under applicable
            open-source licenses. Such components remain governed by their respective open-source license
            terms. We shall comply with the terms of all applicable open-source licenses.
          </p>
        </Section>

        <Section title="38. Feedback">
          <p>
            You may provide feedback, suggestions, or improvements regarding the Platform
            (&quot;Feedback&quot;). All Feedback shall be our exclusive property. By providing Feedback, you
            assign all right, title, and interest in and to the Feedback to us. We may use Feedback
            without any obligation to you.
          </p>
        </Section>

        <Section title="39. API Terms">
          <p>
            We may provide APIs for integration with the Platform. Use of APIs is subject to these Terms
            and any additional API-specific terms. We reserve the right to:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Rate limit API usage</li>
            <li>Authenticate and authorize API access</li>
            <li>Suspend API access for violations of these Terms</li>
            <li>Modify APIs at any time</li>
            <li>Introduce API pricing</li>
            <li>Version APIs</li>
            <li>Retire APIs</li>
            <li>Monitor API usage</li>
          </ul>
        </Section>
      </div>

      {/* PART X */}
      <div className="space-y-6 pt-6">
        <h3 className={PART}>Part X — Platform Security</h3>

        <Section title="40. Security">
          <p>
            We implement and maintain reasonable security safeguards to protect the Platform and User
            data, in compliance with the Digital Personal Data Protection Act, 2023 and the Information
            Technology Act, 2000. Security safeguards include, but are not limited to:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Encryption of data at rest and in transit</li>
            <li>Role-based access controls</li>
            <li>Multi-factor authentication</li>
            <li>Audit logging</li>
            <li>Continuous monitoring</li>
            <li>Secure cloud infrastructure</li>
            <li>Incident response procedures</li>
            <li>Business continuity and disaster recovery</li>
          </ul>
          <p>
            You are responsible for maintaining the security of your account and for notifying us of any
            security concerns.
          </p>
        </Section>

        <Section title="41. Security Incident Reporting">
          <p>
            If you become aware of any security incident or vulnerability affecting the Platform, you
            must report it to us immediately. Please report security incidents to:{" "}
            <a href="mailto:contact@heyattrangi.com" className={LINK}>
              contact@heyattrangi.com
            </a>
          </p>
        </Section>
      </div>

      {/* PART XI */}
      <div className="space-y-6 pt-6">
        <h3 className={PART}>Part XI — Acceptable Use</h3>

        <Section title="42. Acceptable Use">
          <p>
            You agree to use the Platform in accordance with these Terms and all applicable laws. You
            shall not use the Platform in any manner that:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Violates any applicable law, regulation, or guideline</li>
            <li>Infringes the rights of any third party</li>
            <li>Interferes with or disrupts the Platform or its services</li>
            <li>Harms or threatens the safety of any individual</li>
            <li>Is fraudulent, deceptive, or misleading</li>
          </ul>
        </Section>

        <Section title="43. Prohibited Conduct">
          <p>You shall not engage in any of the following prohibited conduct:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Illegal Activities:</strong> Using the Platform for any illegal purpose or in
              violation of any applicable law
            </li>
            <li>
              <strong>Harassment:</strong> Harassing, threatening, intimidating, or abusing any
              individual
            </li>
            <li>
              <strong>Hate Speech:</strong> Posting or transmitting content that is defamatory, hateful,
              discriminatory, or promotes violence
            </li>
            <li>
              <strong>Prompt Injection:</strong> Attempting to manipulate the AI System through prompt
              injection, jailbreaking, or other techniques
            </li>
            <li>
              <strong>Reverse Engineering:</strong> Reverse engineering, decompiling, disassembling, or
              otherwise attempting to derive the source code or algorithms of the Platform
            </li>
            <li>
              <strong>Misuse of AI:</strong> Using the AI System in a manner inconsistent with its
              intended purpose
            </li>
            <li>
              <strong>Data Mining:</strong> Using automated means to extract data from the Platform
              without authorization
            </li>
            <li>
              <strong>Security Testing:</strong> Attempting to probe, scan, or test the vulnerability of
              the Platform without authorization
            </li>
            <li>
              <strong>Interference:</strong> Interfering with or disrupting the Platform or its services
            </li>
          </ul>
        </Section>

        <Section title="44. Content Restrictions">
          <p>You shall not post, transmit, or share any content that:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Is unlawful, harmful, threatening, abusive, harassing, defamatory, obscene, or hateful
            </li>
            <li>Infringes the intellectual property rights of any third party</li>
            <li>Violates the privacy or publicity rights of any third party</li>
            <li>Contains viruses, malware, or other harmful code</li>
            <li>Is false, misleading, or deceptive</li>
          </ul>
        </Section>

        <Section title="45. Reporting Violations">
          <p>
            If you become aware of any violation of these Terms, please report it to us at{" "}
            <a href="mailto:contact@heyattrangi.com" className={LINK}>
              contact@heyattrangi.com
            </a>
            . We will investigate reported violations and take appropriate action, including but not
            limited to warning the violator, removing content, suspending or terminating accounts, and
            reporting to law enforcement authorities.
          </p>
        </Section>
      </div>

      {/* PART XII */}
      <div className="space-y-6 pt-6">
        <h3 className={PART}>Part XII — Account Suspension and Termination</h3>

        <Section title="46. Suspension">
          <p>
            We may suspend your access to the Platform immediately, with or without notice, if:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>You violate these Terms or any applicable policy</li>
            <li>You engage in prohibited conduct</li>
            <li>You pose a security risk to the Platform or other Users</li>
            <li>You provide false or misleading information</li>
            <li>Required by court order or applicable law</li>
            <li>
              We reasonably believe suspension is necessary to protect the safety of you, other Users,
              or the public
            </li>
          </ul>
          <p>
            During suspension, you will not be able to access the Platform or its Services. We will make
            reasonable efforts to notify you of the suspension and the reasons therefor.
          </p>
        </Section>

        <Section title="47. Termination by User">
          <p>You may terminate your account at any time by:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Following the account deletion procedures on the Platform</li>
            <li>
              Contacting us at{" "}
              <a href="mailto:contact@heyattrangi.com" className={LINK}>
                contact@heyattrangi.com
              </a>
            </li>
            <li>Ceasing to use the Platform</li>
          </ul>
          <p>
            Upon termination, your access to the Platform and its Services will cease. For information
            on data retention after termination, please refer to our Data Retention &amp; Deletion
            Policy.
          </p>
        </Section>

        <Section title="48. Termination by Company">
          <p>
            We may terminate your account and these Terms immediately, with or without notice, if:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>You materially breach these Terms</li>
            <li>You engage in prohibited conduct</li>
            <li>You pose a risk to the Platform or other Users</li>
            <li>Required by court order or applicable law</li>
            <li>You fail to pay fees when due</li>
            <li>We discontinue the Platform or Services</li>
          </ul>
          <p>
            We may also terminate your account for any reason, with or without cause, upon reasonable
            notice.
          </p>
        </Section>

        <Section title="49. Effect of Termination">
          <p>Upon termination of your account:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Your access to the Platform and Services shall cease</li>
            <li>Your license to use the Platform shall terminate</li>
            <li>
              User Content may be retained in accordance with our Data Retention &amp; Deletion Policy
              and applicable law
            </li>
            <li>You shall remain liable for any fees or charges incurred prior to termination</li>
            <li>Provisions that by their nature should survive termination shall survive</li>
          </ul>
        </Section>
      </div>

      {/* PART XIII */}
      <div className="space-y-6 pt-6">
        <h3 className={PART}>Part XIII — Disclaimers</h3>

        <Section title="50. General Disclaimer">
          <p>
            THE PLATFORM AND SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY
            KIND, EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, WE DISCLAIM ALL
            WARRANTIES, INCLUDING BUT NOT LIMITED TO:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Implied warranties of merchantability, fitness for a particular purpose, and
              non-infringement
            </li>
            <li>Warranties that the Platform will be uninterrupted, error-free, or secure</li>
            <li>Warranties that the Services will meet your specific needs or expectations</li>
            <li>
              Warranties regarding the accuracy, completeness, or reliability of any content
            </li>
          </ul>
        </Section>

        <Section title="51. AI Services Disclaimer">
          <p>
            The AI System is not a substitute for professional mental healthcare. We do not warrant or
            guarantee the accuracy, completeness, timeliness, or appropriateness of any AI-generated
            content. You should not rely exclusively on the AI System for mental health support, clinical
            guidance, or emergency response. The availability of voice input does not change the nature
            of the service; the AI Companion provides emotional wellness support only and does not
            provide medical diagnosis, treatment, therapy, or emergency services.
          </p>
          <p>
            For more information on AI disclaimers, please refer to our AI Assistance Consent document.
          </p>
        </Section>

        <Section title="52. Therapist Services Disclaimer">
          <p>
            The Platform facilitates consultations with Licensed Therapists but does not itself provide
            therapeutic services. We do not guarantee any specific therapeutic outcome or result.
            Licensed Therapists are independent professionals and are not employees or agents of the
            Company. We shall not be liable for any acts or omissions of Licensed Therapists. For more
            information on therapist services disclaimers, please refer to our Teletherapy Consent
            document.
          </p>
        </Section>

        <Section title="53. Platform Availability Disclaimer">
          <p>
            We do not guarantee uninterrupted, error-free, or always-available access to the Platform.
            The Platform may be unavailable due to maintenance, technical failures, third-party outages,
            or other circumstances beyond our reasonable control.
          </p>
        </Section>

        <Section title="54. No Guarantee of Outcomes">
          <p>We do not guarantee that:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>The Services will improve your mental health or wellbeing</li>
            <li>The Services will prevent or cure any mental health condition</li>
            <li>The Services will achieve any specific outcome</li>
            <li>The Services will meet your specific needs or expectations</li>
          </ul>
        </Section>
      </div>

      {/* PART XIV */}
      <div className="space-y-6 pt-6">
        <h3 className={PART}>Part XIV — Limitation of Liability</h3>

        <Section title="55. Limitation of Liability">
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT,
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Loss of profits, revenue, or business</li>
            <li>Loss of data or goodwill</li>
            <li>Loss of use or opportunity</li>
            <li>Emotional distress or psychological harm</li>
            <li>Any other intangible losses</li>
          </ul>
          <p>
            This limitation applies regardless of the legal theory on which the claim is based, including
            contract, tort, negligence, or strict liability.
          </p>
        </Section>

        <Section title="56. Exclusions">
          <p>Nothing in these Terms excludes or limits our liability:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>For death or personal injury caused by our negligence</li>
            <li>For fraud or fraudulent misrepresentation</li>
            <li>For any liability that cannot be excluded or limited under applicable law</li>
          </ul>
        </Section>

        <Section title="57. Liability Cap">
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, OUR TOTAL LIABILITY TO YOU ARISING OUT OF
            OR IN CONNECTION WITH THESE TERMS OR THE PLATFORM SHALL NOT EXCEED:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              The total amount paid by you to us for the Services in the twelve (12) months preceding
              the claim; or
            </li>
            <li>Five Thousand Indian Rupees (INR 5,000), whichever is greater</li>
          </ul>
          <p>
            This liability cap applies to all claims, whether in contract, tort, negligence, or
            otherwise.
          </p>
        </Section>
      </div>

      {/* PART XV */}
      <div className="space-y-6 pt-6">
        <h3 className={PART}>Part XV — Indemnification</h3>

        <Section title="58. Indemnification by User">
          <p>
            You agree to indemnify, defend, and hold harmless the Company, its affiliates, officers,
            directors, employees, contractors, and agents from and against any claims, liabilities,
            damages, losses, costs, and expenses (including reasonable attorneys&apos; fees) arising out of or
            in connection with:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Your use of the Platform or Services</li>
            <li>Your violation of these Terms</li>
            <li>Your User Content</li>
            <li>Your violation of any applicable law</li>
            <li>Your infringement of any third-party rights</li>
            <li>Your negligent or wrongful conduct</li>
          </ul>
        </Section>

        <Section title="59. Indemnification by Company">
          <p>
            We agree to indemnify, defend, and hold harmless you from and against any claims,
            liabilities, damages, losses, costs, and expenses (including reasonable attorneys&apos; fees)
            arising out of or in connection with:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Our violation of these Terms</li>
            <li>Our violation of any applicable law</li>
            <li>Our infringement of any third-party intellectual property rights</li>
            <li>Our gross negligence or willful misconduct</li>
          </ul>
          <p>Our indemnification obligations shall not apply to claims arising from:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Your User Content</li>
            <li>Your misuse of the Platform</li>
            <li>Your violation of these Terms</li>
          </ul>
        </Section>

        <Section title="60. Indemnification Procedure">
          <p>The indemnified party shall:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Promptly notify the indemnifying party of any claim</li>
            <li>Give the indemnifying party sole control of the defense and settlement of the claim</li>
            <li>Cooperate with the indemnifying party in the defense of the claim</li>
          </ul>
          <p>
            The indemnifying party shall not settle any claim without the indemnified party&apos;s prior
            written consent if the settlement does not include a full release of the indemnified party,
            or requires the indemnified party to admit liability or take any action.
          </p>
        </Section>
      </div>

      {/* PART XVI */}
      <div className="space-y-6 pt-6">
        <h3 className={PART}>Part XVI — Dispute Resolution</h3>

        <Section title="61. Governing Law">
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the Republic of
            India. The courts of Dharwad, Karnataka, India shall have exclusive jurisdiction over any
            disputes arising out of or in connection with these Terms, subject to the arbitration
            provisions set forth below.
          </p>
        </Section>

        <Section title="62. Dispute Resolution">
          <p>
            We and you shall make reasonable efforts to resolve any disputes arising out of or in
            connection with these Terms through good-faith negotiations. If the dispute cannot be
            resolved through negotiations within thirty (30) days of the date on which either party
            notifies the other of the dispute, the dispute shall be referred to mediation in accordance
            with the provisions of the Arbitration and Conciliation Act, 1996.
          </p>
        </Section>

        <Section title="63. Arbitration">
          <p>
            If mediation is unsuccessful, the dispute shall be finally settled by arbitration in
            accordance with the Arbitration and Conciliation Act, 1996. The arbitration shall be
            conducted in English at Dharwad, Karnataka, India. The arbitration shall be conducted by a
            sole arbitrator appointed by mutual agreement of the parties or, failing such agreement, by
            the Company. The arbitrator&apos;s decision shall be final and binding on both parties. The
            parties agree that the arbitration shall be conducted on a confidential basis.
          </p>
        </Section>

        <Section title="64. Class Action Waiver">
          <p>
            To the maximum extent permitted by applicable law, you agree that any dispute shall be
            resolved on an individual basis and not as a class action, collective action, representative
            action, or private attorney general action. You waive any right to participate in class or
            collective proceedings against the Company.
          </p>
        </Section>
      </div>

      {/* PART XVII */}
      <div className="space-y-6 pt-6">
        <h3 className={PART}>Part XVII — General Legal Provisions</h3>

        <Section title="65. Force Majeure">
          <p>
            Neither party shall be liable for any failure or delay in performing its obligations under
            these Terms to the extent that such failure or delay is caused by a Force Majeure Event.
            &quot;Force Majeure Event&quot; means any event or circumstance beyond the reasonable control of a
            party, including but not limited to:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Acts of God, natural disasters, or severe weather</li>
            <li>War, terrorism, civil unrest, or riots</li>
            <li>Pandemics, epidemics, or public health emergencies</li>
            <li>Government actions, regulations, or orders</li>
            <li>Internet outages, telecommunications failures, or power failures</li>
            <li>Cloud provider failures or third-party service provider outages</li>
            <li>Cyberattacks, malware, or security incidents</li>
            <li>Any other event that could not reasonably have been foreseen or prevented</li>
          </ul>
          <p>
            <strong>The Affected Party Shall:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Promptly notify the other party of the Force Majeure Event</li>
            <li>Take reasonable steps to mitigate the impact of the Force Majeure Event</li>
            <li>Resume performance as soon as reasonably practicable</li>
          </ul>
          <p>
            If a Force Majeure Event continues for more than thirty (30) days, either party may terminate
            these Terms upon written notice.
          </p>
        </Section>

        <Section title="66. Severability">
          <p>
            If any provision of these Terms is held to be invalid, illegal, or unenforceable, the
            validity, legality, and enforceability of the remaining provisions shall not be affected or
            impaired. The invalid, illegal, or unenforceable provision shall be replaced by a valid,
            legal, and enforceable provision that most closely reflects the original intent.
          </p>
        </Section>

        <Section title="67. Waiver">
          <p>
            No failure or delay by either party in exercising any right under these Terms shall operate
            as a waiver of that right. No waiver of any breach of these Terms shall be deemed a waiver of
            any subsequent breach.
          </p>
        </Section>

        <Section title="68. Assignment">
          <p>
            You may not assign, transfer, or sublicense these Terms or any rights or obligations
            hereunder without our prior written consent. We may assign, transfer, or sublicense these
            Terms without your consent to an affiliate, or in connection with a merger, acquisition, or
            sale of all or substantially all of our assets. Any assignment in violation of this provision
            shall be void.
          </p>
        </Section>

        <Section title="69. Notices">
          <p>
            <strong>Notices to Us:</strong>
          </p>
          <div className="pl-4 border-l-2 border-gray-300 text-gray-700 space-y-1">
            <p>
              Address: 1344, JAI JITENDRA BUNGLOW, VANASIRI NAGAR, DHARWAD, DHARWAD SATTUR,
              DHARWAD-580009, KARNATAKA. TEL. NO.: 9552324069 India
            </p>
            <p>
              Email:{" "}
              <a href="mailto:support@heyattrangi.com" className={LINK}>
                support@heyattrangi.com
              </a>
            </p>
          </div>
          <p>
            <strong>Notices to You:</strong> Notices to you shall be sent to your registered email
            address or through the Platform.
          </p>
          <p>
            <strong>Notices Shall Be Deemed Received:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>If by email, upon confirmation of delivery</li>
            <li>If through the Platform, upon posting</li>
            <li>If by post, five (5) Business Days after posting</li>
          </ul>
        </Section>

        <Section title="70. Entire Agreement">
          <p>
            These Terms, together with the documents referenced herein, constitute the entire agreement
            between you and us regarding the Platform and Services. These Terms supersede all prior
            agreements, understandings, and communications, whether written or oral, regarding the
            Platform and Services.
          </p>
        </Section>

        <Section title="71. Survival">
          <p>The following provisions shall survive the termination of these Terms:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Intellectual Property</li>
            <li>Disclaimers</li>
            <li>Limitation of Liability</li>
            <li>Indemnification</li>
            <li>Dispute Resolution</li>
            <li>Any other provisions that by their nature should survive termination</li>
          </ul>
        </Section>

        <Section title="72. Contact Us">
          <p>
            If you have any questions, concerns, or complaints about these Terms or the Platform, please
            contact us:
          </p>
          <p className="font-bold text-gray-900">Aatrangi Private Limited</p>
          <div className="pl-4 border-l-2 border-gray-300 text-gray-700 space-y-1 mt-1">
            <p>
              Email:{" "}
              <a href="mailto:support@heyattrangi.com" className={LINK}>
                support@heyattrangi.com
              </a>
            </p>
            <p>
              Website:{" "}
              <a
                href="https://www.heyattrangi.com"
                target="_blank"
                rel="noopener noreferrer"
                className={LINK}
              >
                www.heyattrangi.com
              </a>
            </p>
            <p>
              Address: Aatrangi Private Limited, 1344, JAI JITENDRA BUNGLOW, VANASIRI NAGAR, DHARWAD,
              DHARWAD SATTUR, DHARWAD-580009, KARNATAKA INDIA. TEL. NO.: 9552324069
            </p>
          </div>
        </Section>

        <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-400 pt-4 border-t border-gray-100">
          End of Document
        </p>
      </div>
    </div>
  )
}
