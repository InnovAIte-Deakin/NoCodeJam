import { useState } from 'react';
import { ChevronDown, HelpCircle, BookOpen, Users, Zap, Shield } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  icon: React.ReactNode;
  title: string;
  items: FAQItem[];
}

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

const faqCategories: FAQCategory[] = [
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: 'Getting Started',
    items: [
      {
        question: 'What is NoCodeJam?',
        answer:
          'NoCodeJam is a gamified learning platform where you can master no-code development through interactive challenges. Complete challenges, earn XP points, unlock badges, and compete on leaderboards while building real-world applications without traditional coding.',
      },
      {
        question: 'How do I create an account?',
        answer:
          'Click the "Register" button in the top navigation bar. Fill in your username, email address, and password, then click "Create Account". Once registered, you will be redirected to your dashboard.',
      },
      {
        question: 'Is NoCodeJam free to use?',
        answer:
          'Yes! NoCodeJam is free to join and participate in challenges. Simply register for an account and start completing challenges right away.',
      },
      {
        question: 'What no-code tools will I learn?',
        answer:
          'NoCodeJam covers a wide range of popular no-code platforms including Lovable, Bolt, Windsurf, Cursor, Replit, and many more. New tools and challenges are added regularly.',
      },
    ],
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'Challenges & XP',
    items: [
      {
        question: 'How do I complete a challenge?',
        answer:
          'Navigate to the Challenges page and browse available challenges. Click on a challenge to view its requirements and instructions. Complete the task using the recommended no-code tools, then submit your work (usually a URL or screenshot) through the submission form on the challenge page.',
      },
      {
        question: 'How does XP work?',
        answer:
          'XP (Experience Points) are awarded when you successfully complete and pass challenges. Each challenge has a different XP value based on its difficulty — Beginner challenges award less XP, while Advanced challenges award more. Your total XP determines your position on the leaderboard.',
      },
      {
        question: 'What are the difficulty levels?',
        answer:
          'Challenges are categorised into three difficulty levels: Beginner (great for those just starting out), Intermediate (for those with some no-code experience), and Advanced (for experienced no-code developers looking for a real challenge).',
      },
      {
        question: 'Can I resubmit a challenge?',
        answer:
          'If your submission is rejected by a reviewer, you will receive feedback explaining why. You can then improve your work and resubmit. Aim to read the challenge requirements carefully before submitting.',
      },
    ],
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: 'Profile & Leaderboard',
    items: [
      {
        question: 'How do I update my profile?',
        answer:
          'Click on your avatar in the top-right corner of the navigation bar and select "Profile". From there you can update your display name, avatar image, and other personal details.',
      },
      {
        question: 'How is the leaderboard ranked?',
        answer:
          'The leaderboard ranks users by their total XP earned from completed challenges. The more challenges you complete — especially higher-difficulty ones — the higher your ranking will be.',
      },
      {
        question: 'What are badges?',
        answer:
          'Badges are special achievements you unlock by reaching milestones on the platform — such as completing your first challenge, reaching a certain XP threshold, or completing a full learning pathway. They are displayed on your profile.',
      },
    ],
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Technical & Account Help',
    items: [
      {
        question: 'I forgot my password. What do I do?',
        answer:
          'On the Login page, click "Forgot password?" and enter your email address. You will receive a password reset link in your email. Follow the link to set a new password.',
      },
      {
        question: 'The site is not loading correctly. What should I do?',
        answer:
          'Try refreshing the page first. If the issue persists, try clearing your browser cache or opening the site in a private/incognito window. If you are running the project locally, make sure your .env.local file is correctly configured and your development server is running.',
      },
      {
        question: 'Who do I contact for help?',
        answer:
          'For technical issues with the platform, reach out to your team lead or post in your team communication channel. For questions about a specific challenge, check the challenge description carefully before asking.',
      },
    ],
  },
];

// ─── AccordionItem Component ──────────────────────────────────────────────────

function AccordionItem({ question, answer }: FAQItem) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-[#30363d] rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-[#161b22] hover:bg-[#1c2128] transition-colors duration-200 group"
        aria-expanded={isOpen}
      >
        <span className="text-gray-100 font-medium text-sm sm:text-base pr-4">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 group-hover:text-purple-400 ${
            isOpen ? 'rotate-180 text-purple-400' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-5 py-4 bg-[#0d1117] border-t border-[#30363d]">
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

// ─── FAQPage Component ────────────────────────────────────────────────────────

export function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter FAQ items based on search query
  const filteredCategories = faqCategories
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.items.length > 0);

  const totalResults = filteredCategories.reduce((sum, cat) => sum + cat.items.length, 0);

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">

        {/* ── Header ── */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-3">
            Help &amp; FAQ
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
            Find answers to common questions about NoCodeJam, challenges, contributing, and more.
          </p>
        </div>

        {/* ── Search ── */}
        <div className="mb-10">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[#161b22] border border-[#30363d] text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors duration-200 text-sm sm:text-base"
          />
          {searchQuery && (
            <p className="mt-2 text-sm text-gray-500">
              {totalResults === 0
                ? 'No results found. Try a different search term.'
                : `Showing ${totalResults} result${totalResults !== 1 ? 's' : ''} for "${searchQuery}"`}
            </p>
          )}
        </div>

        {/* ── FAQ Categories ── */}
        {filteredCategories.length > 0 ? (
          <div className="space-y-10">
            {filteredCategories.map((category) => (
              <section key={category.title}>
                {/* Category Header */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    {category.icon}
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-100">
                    {category.title}
                  </h2>
                </div>

                {/* Accordion Items */}
                <div className="space-y-2">
                  {category.items.map((item) => (
                    <AccordionItem
                      key={item.question}
                      question={item.question}
                      answer={item.answer}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No questions match your search.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 text-purple-400 hover:text-purple-300 text-sm underline"
            >
              Clear search
            </button>
          </div>
        )}

        {/* ── Footer CTA ── */}
        <div className="mt-16 p-6 rounded-xl bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-800/40 text-center">
          <h3 className="text-gray-100 font-semibold text-lg mb-2">
            Still have questions?
          </h3>
          <p className="text-gray-400 text-sm">
            Reach out to your team lead or check the project repository for more information.
          </p>
        </div>

      </div>
    </div>
  );
}
