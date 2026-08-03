import type { ReactNode } from "react"

/**
 * Full AI Transparency, Safety & Responsible AI Statement —
 * shared by onboarding modal (same visual language as Terms modal).
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

function Principle({
  number,
  name,
  purpose,
  points,
}: {
  number: number
  name: string
  purpose: string
  points: string[]
}) {
  return (
    <div className="rounded-xl border border-gray-150 bg-gray-50 p-4 space-y-2">
      <p className="font-bold text-[#243460] text-[13px] lg:text-[14px]">
        Principle {number} — {name}
      </p>
      <p className="text-sm text-gray-700">
        <strong>Purpose:</strong> {purpose}
      </p>
      <p className="text-sm font-semibold text-gray-800">What This Means for You:</p>
      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
        {points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </div>
  )
}

export default function AiTransparencyStatementContent() {
  return (
    <div className="font-poppins text-[12px] lg:text-[16px] text-justify bg-white p-8 rounded-xl shadow-lg border border-gray-200 space-y-6 text-gray-800 leading-relaxed">
      <div className="text-center border-b border-gray-100 pb-4 mb-6 space-y-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          Effective Date: 23 JUL 2026 | Last Updated: 23 JUL 2026
        </p>
        <p className="text-xs font-semibold text-gray-500">
          Hey Attrangi (A Digital Mental Health Platform operated by Aatrangi Private Limited)
        </p>
      </div>

      <div className="space-y-6">
        <h3 className={PART}>Section I — Introduction &amp; Scope</h3>

        <Section title="1. Introduction">
          <p>
            Welcome to Hey Attrangi. This AI Transparency, Safety &amp; Responsible AI Statement explains
            how we design, deploy, monitor, evaluate, and govern Artificial Intelligence systems across
            our Platform.
          </p>
          <p>
            We are committed to responsible, ethical, and transparent AI deployment in digital mental
            healthcare. This Statement demonstrates our commitment to ensuring that AI serves humanity,
            benefits people&apos;s lives, and addresses potential harms while fostering responsible
            innovation.
          </p>
          <p className="text-xs text-gray-500 italic">
            This Statement is designed to comply with applicable laws of the Republic of India,
            including the Digital Personal Data Protection Act, 2023, and the Information Technology
            Act, 2000. It is also informed by internationally recognized principles, including the World
            Health Organization&apos;s guidance on the ethics and governance of artificial intelligence for
            health.
          </p>
        </Section>

        <Section title="2. What AI Is Used For">
          <p>
            <strong>AI assists with:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Conversational support</li>
            <li>Mood analysis</li>
            <li>Wellness recommendations</li>
            <li>Personalization</li>
            <li>Crisis detection</li>
            <li>Clinical documentation support</li>
            <li>Therapist workflow assistance</li>
            <li>Voice input processing (converting speech to text for AI interaction)</li>
          </ul>
          <p>
            AI is a supportive tool designed to complement, not replace, professional mental healthcare.
          </p>
        </Section>

        <Section title="3. What AI Cannot Do">
          <p>
            <strong>The AI System:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Is not a psychologist, psychiatrist, therapist, physician, or healthcare practitioner</li>
            <li>Does not independently diagnose any medical or psychological condition</li>
            <li>Does not prescribe medications or recommend specific pharmaceutical treatments</li>
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
            <li>
              Should not be relied upon as the sole source of mental health support, clinical guidance,
              or emergency response
            </li>
            <li>
              Cannot guarantee accuracy, completeness, timeliness, or appropriateness of outputs
            </li>
            <li>Cannot guarantee any specific therapeutic outcome or result</li>
            <li>Does not generate spoken responses (AI always responds in text only)</li>
            <li>
              Does not perform speaker identification, voice authentication, voice biometrics, voice
              profiling, voice cloning, or voiceprint creation
            </li>
          </ul>
          <p>
            We do not represent or warrant that the AI System will meet your specific needs or achieve
            any particular outcome.
          </p>
        </Section>

        <Section title="4. The Role of Therapists">
          <p>
            Licensed Therapists remain solely responsible for all clinical decisions. Therapists retain
            authority to review, override, modify, or disregard AI-generated recommendations whenever
            clinically appropriate. AI outputs are advisory and supplementary. Final clinical decisions
            remain with Licensed Therapists and other qualified mental health professionals.
          </p>
        </Section>

        <Section title="5. Your Rights">
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Understand how AI is used</li>
            <li>Request plain-language explanations of AI-generated outputs where reasonably possible</li>
            <li>Manage AI memory</li>
            <li>
              Withdraw consent for AI services in accordance with our AI Assistance Consent form
            </li>
            <li>Understand how voice input is processed and choose whether to use it</li>
          </ul>
        </Section>
      </div>

      <div className="space-y-6 pt-6">
        <h3 className={PART}>Section II — Responsible AI Principles</h3>

        <Section title="6. Our Responsible AI Principles">
          <p>
            We adopt the following Responsible AI Principles, which guide the design, deployment,
            monitoring, evaluation, and governance of all AI systems across our Platform.
          </p>
        </Section>

        <div className="space-y-3">
          <Principle
            number={1}
            name="Human Oversight"
            purpose="To ensure that AI systems augment, rather than replace, human judgment and clinical decision-making."
            points={[
              "No AI System shall make autonomous clinical decisions without human review and approval where clinical judgment is required",
              "AI outputs shall be clearly identified as AI-generated and shall not be presented as human clinical judgment",
              "All AI outputs shall be subject to appropriate human review where clinically indicated",
              "Licensed Therapists and authorized personnel retain the authority to review, override, modify, or disregard AI-generated recommendations whenever clinically appropriate",
            ]}
          />
          <Principle
            number={2}
            name="Safety First"
            purpose="To ensure that AI systems are designed to minimize the risk of harm to Users."
            points={[
              "AI systems are designed to detect and respond to potential safety concerns",
              "Safety thresholds and parameters are subject to ongoing review and refinement",
              "Incident response procedures are maintained for AI-related safety incidents",
              'The principle of "Do No Harm" guides all AI development and deployment decisions',
            ]}
          />
          <Principle
            number={3}
            name="Privacy by Design"
            purpose="To ensure that privacy protections are embedded into AI systems from the outset."
            points={[
              "AI systems collect and process only such data as is reasonably necessary for specified purposes",
              "Appropriate safeguards are applied to data used for AI improvement",
              "Your consent is obtained for AI services in accordance with our AI Assistance Consent form",
              "Children's data is subject to enhanced protections in accordance with our Children's Privacy & Protection Policy",
            ]}
          />
          <Principle
            number={4}
            name="Clinical Responsibility"
            purpose="To ensure that clinical decisions remain with qualified mental health professionals, and that AI supports, rather than supplants, clinical judgment."
            points={[
              "AI systems shall not independently diagnose medical or psychiatric conditions",
              "AI systems shall not prescribe medications",
              "AI outputs shall not replace the clinical judgment of Licensed Therapists",
              "Clinical documentation shall clearly distinguish between AI-generated content and therapist-generated content",
            ]}
          />
          <Principle
            number={5}
            name="Transparency"
            purpose="To ensure that you understand how AI is used, what it can and cannot do, and how your data is processed."
            points={[
              "You will be clearly informed when you are interacting with AI rather than a human",
              "AI systems shall not present themselves as licensed clinicians",
              "You have access to plain-language explanations of AI-generated outputs where reasonably possible",
              "This Statement and our AI Assistance Consent form are publicly available and regularly updated",
            ]}
          />
          <Principle
            number={6}
            name="Explainability"
            purpose="To ensure that AI systems are interpretable to the extent feasible."
            points={[
              "You have the right to request explanations of AI outputs",
              "Explanations shall be provided in plain, understandable language",
              "We make reasonable efforts to provide meaningful explanations without disclosing proprietary information",
              "Internal documentation maintains records of AI system design and decision-making processes",
            ]}
          />
          <Principle
            number={7}
            name="Accountability"
            purpose="To ensure clear attribution of accountability for AI developers and deployers."
            points={[
              "Clear roles and responsibilities are assigned for AI governance",
              "Incident response and escalation procedures are maintained",
              "Regular audits and reviews are conducted",
              "Continuous improvement mechanisms are implemented",
            ]}
          />
          <Principle
            number={8}
            name="Fairness"
            purpose="To ensure that AI systems are designed and tested in a way that outcomes are fair, non-exclusionary, unbiased, and do not discriminate."
            points={[
              "AI systems are tested for potential biases",
              "Fairness is evaluated across diverse User populations",
              "Mitigation measures are implemented where biases are identified",
              "Continuous monitoring is conducted to ensure ongoing fairness",
            ]}
          />
          <Principle
            number={9}
            name="Security"
            purpose="To ensure that AI systems are secure and resilient against threats."
            points={[
              "AI systems are protected from unauthorized access and manipulation",
              "Security incidents are promptly investigated and remediated",
              "Regular security reviews and assessments are conducted",
              "Security by design principles are applied to AI system development",
            ]}
          />
          <Principle
            number={10}
            name="Reliability"
            purpose="To ensure that AI systems perform reliably and consistently."
            points={[
              "AI system performance is continuously monitored",
              "Quality assurance reviews are conducted regularly",
              "Issues and errors are promptly identified and addressed",
              "Reliability metrics are tracked and reported",
            ]}
          />
          <Principle
            number={11}
            name="User Control"
            purpose="To ensure that you have control over your interactions with AI systems."
            points={[
              "You have the right to request deletion of AI memory",
              "You have the right to withdraw consent for AI services",
              "You have the right to request explanations of AI outputs",
              "You have the right to choose between typed text and voice input",
              "You may grant or withdraw microphone permission at any time through your device settings",
            ]}
          />
          <Principle
            number={12}
            name="Child Safety"
            purpose="To ensure that AI systems provide safe and appropriate interactions for Minor Users."
            points={[
              "AI systems adapt responses according to the Child's age and developmental stage",
              "AI systems use child-friendly language",
              "AI systems automatically restrict unsafe, illegal, explicit, exploitative, or age-inappropriate interactions",
              "Safety concerns are escalated in accordance with applicable policies",
            ]}
          />
          <Principle
            number={13}
            name="Accessibility"
            purpose="To ensure that AI systems are accessible to Users with diverse needs and abilities."
            points={[
              "AI systems are designed with accessibility in mind",
              "User feedback is incorporated to improve accessibility",
              "Continuous improvement of accessibility is pursued",
            ]}
          />
          <Principle
            number={14}
            name="Continuous Improvement"
            purpose="To ensure that AI systems are continuously improved through monitoring, evaluation, user feedback, and research."
            points={[
              "AI systems are continuously monitored and evaluated",
              "User feedback is incorporated into improvement processes",
              "Research and academic collaborations inform improvement",
              "Model training and refinement are conducted with appropriate safeguards",
            ]}
          />
        </div>
      </div>

      <div className="space-y-6 pt-6">
        <h3 className={PART}>Section III — Capabilities, Voice, Safety &amp; Governance</h3>

        <Section title="7. AI Systems on Our Platform">
          <p>
            Our Platform may utilize one or more of the following types of AI models and technologies:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Proprietary AI Models:</strong> AI models developed internally
            </li>
            <li>
              <strong>Open-Source AI Models:</strong> AI models distributed under open-source licenses
            </li>
            <li>
              <strong>Third-Party Commercial AI Models:</strong> AI models provided by trusted
              third-party service providers operating under appropriate contractual, privacy,
              confidentiality, and security obligations
            </li>
          </ul>
          <p>
            The specific AI technologies utilized may evolve over time. All AI models deployed on our
            Platform are subject to the Responsible AI Principles set forth in this Statement,
            regardless of their origin. Our Platform may utilize multimodal AI (processing multiple
            types of data inputs) and future AI technologies as they are introduced, subject to this
            Statement.
          </p>
        </Section>

        <Section title="8. AI Capabilities">
          <p>
            The AI System provides the following capabilities, which may evolve over time:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Conversational AI:</strong> Engaging in text-based conversations to provide
              emotional wellbeing support, active listening, and guided reflection. You may interact
              with the AI either by typing text or by using voice input, as described in this Statement.
            </li>
            <li>
              <strong>Voice Input Processing:</strong> Converting spoken input into text for AI
              interaction. Raw audio is not retained after successful transcription. Only the generated
              transcript becomes part of your conversation history.
            </li>
            <li>
              <strong>Mood Analysis:</strong> Analyzing mood based on inputs, assessments, and
              interaction patterns to provide insights and recommendations
            </li>
            <li>
              <strong>Emotional Support:</strong> Providing supportive and non-judgmental responses to
              concerns
            </li>
            <li>
              <strong>Personalization:</strong> Tailoring responses, recommendations, and content to
              preferences and needs
            </li>
            <li>
              <strong>Conversation Memory:</strong> Retaining information from previous conversations to
              provide continuity of support
            </li>
            <li>
              <strong>Wellness Recommendations:</strong> Providing personalized recommendations for
              wellness activities, coping strategies, and self-care practices
            </li>
            <li>
              <strong>Assessment Support:</strong> Administering standardized and non-standardized
              screening tools to assess aspects of mental health
            </li>
            <li>
              <strong>Medication Reminders:</strong> Providing notifications to support adherence to
              prescribed medication regimens
            </li>
            <li>
              <strong>Journal Insights:</strong> Offering prompts, guidance, and reflective questions to
              support journaling practice
            </li>
            <li>
              <strong>Risk Identification:</strong> Identifying potential clinical risks based on inputs
              and interaction patterns
            </li>
            <li>
              <strong>Crisis Detection:</strong> Identifying potential indicators of crisis situations
            </li>
            <li>
              <strong>Clinical Documentation Support:</strong> Assisting with the preparation of clinical
              documentation
            </li>
            <li>
              <strong>Therapist Workflow Assistance:</strong> Supporting Licensed Therapists with
              documentation and workflow management
            </li>
            <li>
              <strong>Follow-up Recommendations:</strong> Generating recommendations for follow-up care
            </li>
            <li>
              <strong>Multilingual Support:</strong> Supporting conversations in multiple languages
            </li>
            <li>
              <strong>Future Multimodal Capabilities:</strong> Any additional capabilities that may be
              introduced in the future
            </li>
          </ul>
        </Section>

        <Section title="9. Voice Input Processing">
          <p>
            The Platform offers you the option to provide input to the AI Companion through voice, in
            addition to typed text. This section explains how voice input works and how your voice data
            is processed.
          </p>
          <p>
            <strong>9.1 Optional Nature.</strong> Voice input is entirely optional. You may continue to
            interact with the AI Companion exclusively through typed text if you so choose. Typing
            remains fully supported at all times.
          </p>
          <p>
            <strong>9.2 How Voice Input Works.</strong> When you choose to use voice input:
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
            <strong>9.3 Data Retention and Privacy.</strong>
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
            <li>
              <strong>No Voice Storage:</strong> Your voice is not used to create a voiceprint or
              biometric profile.
            </li>
          </ul>
          <p>
            <strong>9.4 Speech Recognition Limitations.</strong> Speech recognition technology may
            occasionally generate inaccurate words, punctuation, names, accents, or interpretations.
            Factors that may affect accuracy include background noise, accents and dialects, speech
            clarity and speed, and technical limitations of the speech recognition service. You remain
            responsible for reviewing important information before relying upon AI responses. We
            recommend reviewing critical information that may affect your health, safety, or wellbeing.
          </p>
          <p>
            <strong>9.5 Voice Interactions and AI Safeguards.</strong> Voice conversations are subject
            to the same AI limitations, safety mechanisms, content moderation, crisis detection, and
            disclaimers that apply to typed conversations. The AI System&apos;s safety measures operate
            regardless of how you provide input.
          </p>
          <p>
            <strong>9.6 User Control.</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              You may grant or withdraw microphone permission at any time through your device&apos;s
              operating system settings
            </li>
            <li>
              If microphone permission is denied, voice input becomes unavailable while text input
              continues to function normally
            </li>
            <li>
              Your decision to use or not use voice input does not affect your access to any other
              Platform features
            </li>
          </ul>
        </Section>

        <Section title="10. Explainability">
          <p>
            You may request plain-language explanations, where reasonably possible, regarding
            AI-generated recommendations or outputs. Requests for explanations shall be processed in a
            timely manner and shall be provided in plain, understandable language. We make reasonable
            efforts to provide meaningful explanations without disclosing proprietary information.
          </p>
          <p>The following information is not publicly disclosed:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Proprietary algorithms and model architecture</li>
            <li>Internal safety thresholds and confidence scores</li>
            <li>Confidential implementation details</li>
            <li>Trade secrets and other proprietary information</li>
          </ul>
          <p>
            We maintain internal documentation of AI system design, decision-making processes, and safety
            mechanisms to support explainability and accountability.
          </p>
        </Section>

        <Section title="11. AI Safety">
          <p>
            We implement comprehensive safety mechanisms to protect Users and ensure responsible AI
            operation.
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Internal Confidence Mechanisms:</strong> The AI System employs internally defined
              confidence scores and safety thresholds to evaluate the reliability of its outputs and
              identify potential safety concerns.
            </li>
            <li>
              <strong>Safety Systems:</strong> Safety systems include content moderation, risk
              detection, crisis detection, and clinical escalation procedures.
            </li>
            <li>
              <strong>Risk Detection:</strong> The AI System is designed to identify potential
              indicators of risk, including but not limited to suicide risk, self-harm, violence, abuse,
              neglect, severe psychosis, and medical emergencies.
            </li>
            <li>
              <strong>Content Moderation:</strong> Automated and human content moderation is implemented
              to prevent exposure to inappropriate, harmful, or age-inappropriate content.
            </li>
            <li>
              <strong>Human Oversight:</strong> Human oversight is maintained for AI outputs,
              particularly in safety-critical contexts.
            </li>
            <li>
              <strong>Clinical Escalation:</strong> Procedures are maintained for escalating safety
              concerns to Licensed Therapists, clinical supervisors, crisis response staff, and, where
              appropriate, emergency services.
            </li>
            <li>
              <strong>Safety Monitoring:</strong> Continuous monitoring of AI system safety performance
              is conducted.
            </li>
            <li>
              <strong>Child Protections:</strong> Enhanced safety protections are implemented for Minor
              Users in accordance with our Children&apos;s Privacy &amp; Protection Policy.
            </li>
            <li>
              <strong>Crisis Handling:</strong> The AI System includes crisis detection and escalation
              capabilities, as governed by our Crisis Intervention Consent form.
            </li>
            <li>
              <strong>Confidentiality of Safety Parameters:</strong> Internal confidence scores,
              thresholds, and safety parameters are proprietary and confidential. These are not publicly
              disclosed to protect the integrity and effectiveness of the safety systems and to prevent
              attempts to circumvent safety measures.
            </li>
          </ul>
        </Section>

        <Section title="12. Limitations">
          <p>
            You acknowledge and accept that the AI System has significant limitations, including but not
            limited to:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Inaccurate Outputs:</strong> The AI System may generate responses that are
              factually incorrect, outdated, or inconsistent with established clinical knowledge
            </li>
            <li>
              <strong>Incomplete Outputs:</strong> The AI System may generate responses that are
              incomplete, superficial, or fail to address the full scope of your concerns
            </li>
            <li>
              <strong>Misunderstanding Context:</strong> The AI System may misinterpret your inputs,
              context, or intent
            </li>
            <li>
              <strong>Misleading Outputs:</strong> The AI System may generate outputs that appear
              authoritative or clinically valid but are, in fact, misleading or inappropriate
            </li>
            <li>
              <strong>Failure to Detect Emergencies:</strong> The AI System may fail to detect crisis
              situations that would be recognizable to a human professional
            </li>
            <li>
              <strong>Hallucination:</strong> The AI System may generate content that appears plausible
              but is entirely fabricated
            </li>
            <li>
              <strong>Generalized Responses:</strong> The AI System may provide responses that are
              overly generalized and fail to address your specific needs
            </li>
            <li>
              <strong>Impact of Incomplete User Input:</strong> The AI System&apos;s responses are
              dependent on the completeness and accuracy of your inputs
            </li>
            <li>
              <strong>Lack of Emotional Intelligence:</strong> The AI System lacks genuine emotional
              intelligence, empathy, and the capacity for human connection that is fundamental to
              effective therapeutic relationships
            </li>
            <li>
              <strong>Speech Recognition Errors:</strong> Speech recognition technology may occasionally
              misinterpret words, context, or meaning, leading to inaccurate transcripts and potentially
              inappropriate AI responses
            </li>
          </ul>
          <p>
            You should verify important decisions with qualified professionals where appropriate. We do
            not warrant or guarantee the accuracy, completeness, timeliness, or appropriateness of any
            AI-generated content.
          </p>
        </Section>

        <Section title="13. AI Memory">
          <p>
            The AI System maintains memory of previous conversations and interactions to provide
            continuity of care and personalized experiences.
          </p>
          <p>
            <strong>AI Memory May Include:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Previous discussions and conversational exchanges</li>
            <li>Previous emotional concerns and themes</li>
            <li>User preferences, including communication style and content preferences</li>
            <li>Wellness goals and objectives</li>
            <li>Previous recommendations</li>
            <li>Mood trends and patterns</li>
            <li>Behavioural patterns</li>
          </ul>
          <p>
            <strong>Managing AI Memory:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              You may request deletion or modification of portions of AI memory where operationally
              feasible and subject to applicable legal, clinical, and governance obligations
            </li>
            <li>
              Therapists and authorized Caregivers (where applicable) may manage relevant AI memory
              where clinically appropriate
            </li>
            <li>
              Deletion requests shall be processed in accordance with our Privacy Policy, Data Retention
              &amp; Deletion Policy, and applicable law
            </li>
          </ul>
          <p>
            For more information on AI memory, please refer to our AI Assistance Consent form.
          </p>
        </Section>

        <Section title="14. Model Training">
          <p>
            The AI System does not automatically learn from each individual conversation in real time.
            Model improvements occur through controlled training, evaluation, validation, governance,
            and quality assurance processes.
          </p>
          <p>
            <strong>Safeguards Applied to Model Training:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>De-identification:</strong> Removing or modifying personal identifiers from data
              used for training
            </li>
            <li>
              <strong>Anonymization:</strong> Rendering data irreversible such that it cannot be linked
              to an identifiable individual
            </li>
            <li>
              <strong>Aggregation:</strong> Combining data from multiple individuals into summary form
            </li>
            <li>
              <strong>Human Review:</strong> Human review of training data and processes
            </li>
            <li>
              <strong>Clinical Governance:</strong> Clinical oversight of model training and improvement
            </li>
            <li>
              <strong>Quality Assurance:</strong> Quality assurance reviews of model performance
            </li>
            <li>
              <strong>Privacy Review:</strong> Privacy review of training data and processes
            </li>
          </ul>
          <p>
            Children&apos;s information is subject to enhanced protections in accordance with our
            Children&apos;s Privacy &amp; Protection Policy. For more information on data processing and AI
            improvement, please refer to our Data Processing Consent form and Privacy Policy.
          </p>
        </Section>

        <Section title="15. Bias, Fairness &amp; Quality">
          <p>We are committed to identifying and mitigating potential biases in AI systems.</p>
          <p>
            <strong>Our Commitments:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Bias Testing:</strong> Testing AI systems for potential biases across diverse User
              populations
            </li>
            <li>
              <strong>Fairness Evaluation:</strong> Evaluating the fairness of AI outputs and outcomes
            </li>
            <li>
              <strong>Clinical Validation:</strong> Validating AI outputs against clinical standards and
              expectations
            </li>
            <li>
              <strong>Internal Testing:</strong> Conducting internal testing of AI system performance
            </li>
            <li>
              <strong>User Feedback:</strong> Incorporating User feedback into improvement processes
            </li>
            <li>
              <strong>Academic Collaborations:</strong> Collaborating with academic institutions on
              research and evaluation
            </li>
            <li>
              <strong>Benchmarking:</strong> Benchmarking AI system performance against industry
              standards
            </li>
            <li>
              <strong>Continuous Monitoring:</strong> Continuously monitoring AI system performance for
              potential issues
            </li>
            <li>
              <strong>Performance Evaluation:</strong> Regularly evaluating AI system performance against
              established metrics
            </li>
            <li>
              <strong>Risk Assessment:</strong> Conducting risk assessments for AI system deployment
            </li>
          </ul>
        </Section>

        <Section title="16. Human Oversight">
          <p>
            Therapists and authorized personnel retain authority to review, override, modify, or
            disregard AI-generated recommendations whenever clinically appropriate.
          </p>
          <p>
            <strong>Human Oversight Throughout the AI Lifecycle:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Design:</strong> Human input in AI system design and development
            </li>
            <li>
              <strong>Deployment:</strong> Human review of AI system deployment and configuration
            </li>
            <li>
              <strong>Monitoring:</strong> Human monitoring of AI system performance
            </li>
            <li>
              <strong>Review:</strong> Human review of AI outputs where clinically indicated
            </li>
            <li>
              <strong>Escalation:</strong> Human escalation of safety concerns
            </li>
            <li>
              <strong>Improvement:</strong> Human input into AI system improvement processes
            </li>
            <li>
              <strong>Governance:</strong> Human oversight of AI governance and accountability
            </li>
          </ul>
          <p>
            <strong>Human Oversight Procedures:</strong> Quality assurance reviews, clinical
            supervision, incident response and escalation, performance monitoring, and continuous
            improvement. Final clinical decisions remain with Licensed Therapists and other qualified
            mental health professionals.
          </p>
        </Section>

        <Section title="17. Service Availability">
          <p>
            We aim to provide continuous availability of AI services but do not guarantee uninterrupted,
            error-free, or always-available AI services.
          </p>
          <p>
            <strong>If AI Services Become Temporarily Unavailable:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Some Platform functionality may be reduced</li>
            <li>AI-generated recommendations and outputs may not be available</li>
            <li>
              Therapist-led services and other human-supported services may continue where operationally
              available
            </li>
            <li>
              You will be notified of significant service disruptions where reasonably practicable
            </li>
          </ul>
          <p>
            We make reasonable efforts to restore AI services promptly following disruptions.
          </p>
        </Section>

        <Section title="18. Future AI">
          <p>
            We reserve the right to introduce new AI technologies and capabilities, including but not
            limited to:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>New AI Models</li>
            <li>
              Voice AI (the AI may support additional voice-related capabilities in the future)
            </li>
            <li>Vision AI</li>
            <li>Multimodal AI</li>
            <li>Agentic AI</li>
            <li>Personalized AI</li>
            <li>Other Emerging AI Technologies</li>
          </ul>
          <p>
            <strong>Introduction of New AI Technologies Shall Be Subject To:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>This Statement and the Responsible AI Principles set forth herein</li>
            <li>Applicable governance processes</li>
            <li>Risk assessment and evaluation</li>
            <li>Appropriate User notice and consent where required</li>
            <li>Applicable legal and regulatory requirements</li>
          </ul>
        </Section>

        <Section title="19. AI Governance">
          <p>
            We maintain a comprehensive AI governance framework to ensure responsible AI deployment.
          </p>
          <p>
            <strong>Governance Roles and Responsibilities:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>AI Governance Office:</strong> Overseeing AI governance and compliance;
              maintaining this Statement and associated policies; conducting AI risk assessments;
              monitoring AI system performance and safety; coordinating AI incident response
            </li>
            <li>
              <strong>Clinical Governance Office:</strong> Overseeing clinical aspects of AI deployment;
              ensuring clinical validation and quality assurance; managing clinical escalation
              procedures; overseeing therapist oversight of AI outputs
            </li>
            <li>
              <strong>Privacy &amp; Compliance Office:</strong> Ensuring privacy compliance in AI
              systems; overseeing data protection in AI processing; managing User rights and consent;
              ensuring compliance with applicable laws
            </li>
            <li>
              <strong>Engineering Team:</strong> Developing and maintaining AI systems; implementing
              technical safeguards; conducting performance monitoring; addressing technical issues and
              incidents
            </li>
            <li>
              <strong>Security Team:</strong> Securing AI systems and data; investigating security
              incidents; conducting security reviews; implementing security safeguards
            </li>
            <li>
              <strong>Licensed Therapists:</strong> Exercising clinical judgment in AI-supported
              contexts; reviewing AI outputs where clinically indicated; escalating safety concerns;
              providing feedback on AI system performance
            </li>
            <li>
              <strong>Legal Department:</strong> Ensuring legal compliance; managing legal risks;
              overseeing regulatory engagement
            </li>
            <li>
              <strong>Executive Leadership:</strong> Providing strategic oversight; allocating resources
              for AI governance; approving AI governance policies; ensuring accountability
            </li>
          </ul>
          <p>
            <strong>Governance Workflows:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Periodic Review:</strong> AI systems and governance frameworks are reviewed
              periodically to ensure they remain effective and compliant
            </li>
            <li>
              <strong>Risk Assessment:</strong> Risk assessments are conducted for new AI deployments and
              significant changes to existing AI systems
            </li>
            <li>
              <strong>Incident Management:</strong> Incident response procedures are maintained for
              AI-related incidents
            </li>
            <li>
              <strong>Continuous Improvement:</strong> Lessons learned from monitoring, incidents, and
              feedback are incorporated into continuous improvement processes
            </li>
          </ul>
        </Section>

        <Section title="20. Changes to This Statement">
          <p>
            We may update this Statement from time to time to reflect changes in practices, legal
            requirements, or operational needs. When material changes are made to this Statement, we will
            notify you through:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>The Platform</li>
            <li>Email to registered email addresses</li>
            <li>In-app notifications</li>
            <li>Any other appropriate means</li>
          </ul>
          <p>
            The &quot;Effective Date&quot; at the top of this Statement indicates when it was last revised. Your
            continued use of the Platform after the effective date of any changes constitutes your
            acceptance of the updated Statement, subject to any additional consent requirements under
            applicable law.
          </p>
        </Section>

        <Section title="21. Contact Us">
          <p>
            If you have any questions, concerns, or complaints about this Statement or our AI practices,
            please contact us:
          </p>
          <p className="font-bold text-gray-900">Aatrangi Private Limited</p>
          <div className="pl-4 border-l-2 border-gray-300 text-gray-700 space-y-1 mt-1">
            <p>
              Email:{" "}
              <a href="mailto:contact@heyattrangi.com" className={LINK}>
                contact@heyattrangi.com
              </a>
            </p>
            <p>
              Website:{" "}
              <a
                href="https://www.heyattrangi.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={LINK}
              >
                https://www.heyattrangi.com/
              </a>
            </p>
            <p>
              Address: Aatrangi Private Limited, Jai Jinendra Banglow, Hubli-Dharwad Road, KHB Colony,
              Narayanpura, Dharwad, Karnataka - 580009, India
            </p>
          </div>
          <p>
            If you are not satisfied with our response, you have the right to file a complaint with the
            Data Protection Board of India in accordance with the Digital Personal Data Protection Act,
            2023.
          </p>
        </Section>

        <Section title="Related Documents">
          <p>This Statement should be read together with:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Our Privacy Policy</li>
            <li>Our Terms &amp; Conditions</li>
            <li>Our AI Assistance Consent form</li>
            <li>Our General Treatment Consent form</li>
            <li>Our Teletherapy Consent form</li>
            <li>Our Crisis Intervention Consent form</li>
            <li>Our Data Processing Consent form</li>
            <li>Our Children&apos;s Privacy &amp; Protection Policy</li>
          </ul>
          <p>Thank you for trusting Hey Attrangi with your mental health journey.</p>
        </Section>

        <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-400 pt-4 border-t border-gray-100">
          End of Document
        </p>
      </div>
    </div>
  )
}
