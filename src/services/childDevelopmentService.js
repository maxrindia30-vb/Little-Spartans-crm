/**
 * Little Spartans ZenConnect CRM - Child Development & Skill Journey Service
 * 
 * Provides centralized data models, badge definitions, milestone tracking,
 * radar chart calculation, coach session observation rubrics, and Super Coach verification.
 */

export const BADGE_STATUSES = {
  LOCKED: 'locked',
  IN_PROGRESS: 'in_progress',
  READY_FOR_ASSESSMENT: 'ready_for_assessment',
  COMPLETED: 'completed',
};

export const SUBMISSION_STATUSES = {
  DRAFT: 'Draft',
  PENDING: 'Pending Super Coach Review',
  APPROVED: 'Approved & Published',
  RETURNED: 'Returned for Correction',
  REJECTED: 'Rejected',
};

export const RADAR_DIMENSIONS = [
  { key: 'balance', label: 'Balance', fullMark: 100 },
  { key: 'coordination', label: 'Coordination', fullMark: 100 },
  { key: 'agility', label: 'Agility', fullMark: 100 },
  { key: 'strength', label: 'Strength', fullMark: 100 },
  { key: 'flexibility', label: 'Flexibility', fullMark: 100 },
  { key: 'stamina', label: 'Stamina', fullMark: 100 },
  { key: 'focus', label: 'Focus', fullMark: 100 },
  { key: 'confidence', label: 'Confidence', fullMark: 100 },
  { key: 'instructions', label: 'Instructions', fullMark: 100 },
];

/**
 * Standard badge curriculum catalog by program and age tier
 */
export const PROGRAM_BADGE_CATALOG = {
  'Foundational Movement': [
    {
      id: 'BADGE-FM-JUMP',
      name: 'Jumping',
      category: 'Locomotor',
      iconType: 'rabbit',
      ageGroup: 'Ages 3 – 5',
      badgeColor: '#10B981',
      bgGlow: '#ECFDF5',
      description: 'Learnt two-foot takeoff and safe, balanced landing without falling.',
      whatChildDid: [
        'Practised two-foot spring takeoff with balanced form',
        'Landed softly with knee absorption and no wobbling',
        'Maintained upright upper body posture throughout the jump',
      ],
      rubricCriteria: 'Can jump 15cm hurdle and land steadily 3 consecutive times.',
    },
    {
      id: 'BADGE-FM-TURNS',
      name: 'Taking Turns',
      category: 'Social & Emotional',
      iconType: 'fox_bear',
      ageGroup: 'Ages 3 – 5',
      badgeColor: '#F4510B',
      bgGlow: '#FFF4E8',
      description: 'Learnt to wait, share and give others a chance during games and activities.',
      whatChildDid: [
        'Waited for their turn during agility line activities',
        'Shared equipment and cones politely with friends',
        'Showed good teamwork and peer encouragement',
      ],
      rubricCriteria: 'Voluntarily steps into line and waits without distress for 5 turns.',
    },
    {
      id: 'BADGE-FM-HOP',
      name: 'Hopping',
      category: 'Locomotor',
      iconType: 'duck',
      ageGroup: 'Ages 3 – 5',
      badgeColor: '#0284C7',
      bgGlow: '#F0F9FF',
      description: 'Mastering single-leg balance and continuous hops across the obstacle mat.',
      whatChildDid: [
        'Hopped 5 times consecutively on preferred foot',
        'Maintained single-leg balance for 3+ seconds before hopping',
        'Transitioned smoothly between hoop targets on floor',
      ],
      rubricCriteria: 'Hops across 4 floor rings on either foot without stumbling.',
    },
    {
      id: 'BADGE-FM-BAL',
      name: 'Balancing',
      category: 'Stability',
      iconType: 'beam_girl',
      ageGroup: 'Ages 3 – 5',
      badgeColor: '#6366F1',
      bgGlow: '#EEF2FF',
      description: 'Walk across low balance beam with arms outstretched, keeping eyes forward.',
      whatChildDid: [
        'Walked across 2-metre balance beam without stepping off',
        'Held arms in airplane posture for dynamic stability',
        'Completed forward and heel-to-toe walking smoothly',
      ],
      rubricCriteria: 'Crosses beam twice with zero foot touches on the mat.',
    },
    {
      id: 'BADGE-FM-THROW',
      name: 'Throwing',
      category: 'Object Control',
      iconType: 'target',
      ageGroup: 'Ages 3 – 5',
      badgeColor: '#EC4899',
      bgGlow: '#FDF2F8',
      description: 'Developing overarm and underarm throw accuracy towards foam targets.',
      whatChildDid: [
        'Gripped ball comfortably with fingers spread',
        'Stepped forward with opposite foot during throwing motion',
        'Hit 3 out of 5 target rings from 2 metres distance',
      ],
      rubricCriteria: 'Hits 3 targets with proper opposite-foot step mechanics.',
    },
    {
      id: 'BADGE-FM-RUN',
      name: 'Running',
      category: 'Locomotor',
      iconType: 'sprinter',
      ageGroup: 'Ages 3 – 5',
      badgeColor: '#059669',
      bgGlow: '#ECFDF5',
      description: 'High-knee sprint mechanics, straight-line trajectory, and controlled stopping.',
      whatChildDid: [
        'Ran with high knee drive and active arm pumping',
        'Maintained focus within running lane markers',
        'Decelerated to a safe stop within marked deceleration box',
      ],
      rubricCriteria: '15-metre sprint with proper arm-leg opposition.',
    },
    {
      id: 'BADGE-FM-SKIP',
      name: 'Skipping',
      category: 'Locomotor',
      iconType: 'rope_kid',
      ageGroup: 'Ages 3 – 5',
      badgeColor: '#D97706',
      bgGlow: '#FEF3C7',
      description: 'Rhythmic step-hop pattern coordination with natural alternating arm swing.',
      whatChildDid: [
        'Performed coordinated step-hop rhythm across 10 metres',
        'Maintained light footfalls on balls of feet',
        'Coordinated cadence with musical tempo in warmup',
      ],
      rubricCriteria: 'Continuous skip for 10 metres without breaking rhythm.',
    },
    {
      id: 'BADGE-FM-STAR',
      name: 'Focus Star',
      category: 'Cognitive & Focus',
      iconType: 'star',
      ageGroup: 'Ages 3 – 5',
      badgeColor: '#F59E0B',
      bgGlow: '#FEF3C7',
      description: 'Listened attentively to coach instructions and stayed focused during warmups.',
      whatChildDid: [
        'Made steady eye contact during coach demonstrations',
        'Followed two-step drill instructions on first prompt',
        'Remained on personal marker during team explanations',
      ],
      rubricCriteria: 'Zero reminders needed across an entire 45-minute session.',
    },
    {
      id: 'BADGE-FM-TEAM',
      name: 'Team Player',
      category: 'Social & Emotional',
      iconType: 'friends',
      ageGroup: 'Ages 3 – 5',
      badgeColor: '#3B82F6',
      bgGlow: '#EFF6FF',
      description: 'Cheered for peers and helped coaches collect training cones after class.',
      whatChildDid: [
        'High-fived teammates after completing agility circuits',
        'Helped gather lightweight cones at end of drill',
        'Used encouraging words when friends needed support',
      ],
      rubricCriteria: 'Actively demonstrates supportive social habits in 3 classes.',
    },
  ],
  'Football': [
    {
      id: 'BADGE-FT-DRIBBLE',
      name: 'Ball Master',
      category: 'Object Control',
      iconType: 'dribble',
      ageGroup: 'Ages 5 – 12',
      badgeColor: '#10B981',
      bgGlow: '#ECFDF5',
      description: 'Close ball control with inside and outside of both feet through slalom cones.',
      whatChildDid: [
        'Slalomed through 6 cones with maximum 2 touches per gate',
        'Used sole-roll turns to reverse direction cleanly',
        'Kept chin up to scan field while maintaining control',
      ],
      rubricCriteria: 'Completes 6-cone slalom without touching cones in under 12 seconds.',
    },
    {
      id: 'BADGE-FT-PASS',
      name: 'First Touch Pass',
      category: 'Teamwork',
      iconType: 'pass',
      ageGroup: 'Ages 5 – 12',
      badgeColor: '#3B82F6',
      bgGlow: '#EFF6FF',
      description: 'Cushioned first touch reception followed by crisp side-foot pass to partner.',
      whatChildDid: [
        'Received aerial or rolling ball with soft first touch',
        'Executed 10 accurate side-foot passes to partner',
        'Called for the ball with clear verbal and visual signal',
      ],
      rubricCriteria: '80% pass accuracy over 10-metre distance in drill.',
    },
    {
      id: 'BADGE-FT-STRIKE',
      name: 'Target Striker',
      category: 'Object Control',
      iconType: 'target',
      ageGroup: 'Ages 5 – 12',
      badgeColor: '#F4510B',
      bgGlow: '#FFF4E8',
      description: 'Instep drive and placed shots into lower corners of mini target goal.',
      whatChildDid: [
        'Planted non-kicking foot alongside ball pointing at target',
        'Struck through center of ball with locked ankle',
        'Scored 4 out of 5 attempts into target corner pockets',
      ],
      rubricCriteria: '4 out of 5 target strikes from outside penalty box.',
    },
    {
      id: 'BADGE-FT-SHIELD',
      name: 'Defender Wall',
      category: 'Agility & Tactics',
      iconType: 'shield',
      ageGroup: 'Ages 5 – 12',
      badgeColor: '#6366F1',
      bgGlow: '#EEF2FF',
      description: 'Jockey stance, low center of gravity, and disciplined 1-on-1 containment.',
      whatChildDid: [
        'Adopted side-on body stance with knees bent',
        'Forced attacker away from center goal into sidelines',
        'Timed tackle cleanly without committing foul',
      ],
      rubricCriteria: 'Successfully contains dribbler in 3 out of 4 1v1 challenges.',
    },
    {
      id: 'BADGE-FT-PLAY',
      name: 'Fair Play Hero',
      category: 'Social & Emotional',
      iconType: 'handshake',
      ageGroup: 'Ages 5 – 12',
      badgeColor: '#F59E0B',
      bgGlow: '#FEF3C7',
      description: 'Demonstrated outstanding sportsmanship, referee respect, and team unity.',
      whatChildDid: [
        'Helped fallen opponents up during small-sided match',
        'Accepted referee decisions with respectful gesture',
        'Shook hands with opposing squad after scrimmage',
      ],
      rubricCriteria: 'Exemplary conduct and positive attitude across 4 match days.',
    },
  ],
  'Athletics': [
    {
      id: 'BADGE-ATH-SPRINT',
      name: 'Rocket Sprint',
      category: 'Speed',
      iconType: 'sprinter',
      ageGroup: 'Ages 6 – 14',
      badgeColor: '#EF4444',
      bgGlow: '#FEF2F2',
      description: 'Explosive start from blocks/crouch and efficient drive phase sprint mechanics.',
      whatChildDid: [
        'Reacted swiftly to whistle within 0.3s starting reaction',
        'Drove knees powerfully through first 10 metres',
        'Maintained upright sprint posture through finish line',
      ],
      rubricCriteria: 'Meets age-standard sprint time over 30 metres.',
    },
    {
      id: 'BADGE-ATH-HURDLE',
      name: 'Hurdle Hopper',
      category: 'Coordination',
      iconType: 'beam_girl',
      ageGroup: 'Ages 6 – 14',
      badgeColor: '#8B5CF6',
      bgGlow: '#F5F3FF',
      description: '3-stride rhythm between mini hurdles with clean lead-leg extension.',
      whatChildDid: [
        'Cleared 4 mini hurdles with consistent 3-stride rhythm',
        'Tucked trail leg smoothly without clipping hurdles',
        'Maintained forward momentum upon landing',
      ],
      rubricCriteria: 'Flawless 4-hurdle run with unbroken 3-stride pattern.',
    },
    {
      id: 'BADGE-ATH-ENDURANCE',
      name: 'Endurance Warrior',
      category: 'Stamina',
      iconType: 'star',
      ageGroup: 'Ages 6 – 14',
      badgeColor: '#059669',
      bgGlow: '#ECFDF5',
      description: 'Consistent pacing, rhythmic breathing, and stamina during distance laps.',
      whatChildDid: [
        'Paced 400m run evenly without early exhaustion',
        'Used 2-in 2-out rhythmic nasal-oral breathing',
        'Finished with strong kick in final 50 metres',
      ],
      rubricCriteria: 'Completes 400m within personal target zone.',
    },
  ],
};

/**
 * Standard milestone catalog
 */
export const MILESTONE_CATALOG = [
  {
    id: 'MS-FM-L1',
    title: 'Level 1 Foundational Movement Complete',
    category: 'Curriculum Completion',
    program: 'Foundational Movement',
    iconType: 'trophy',
    description: 'Successfully mastered basic motor skills, obstacle navigation and body balance.',
    defaultAge: 'Ages 3 – 5',
  },
  {
    id: 'MS-ATT-25',
    title: '25 Training Sessions Milestone',
    category: 'Attendance & Dedication',
    program: 'All Programs',
    iconType: 'star',
    description: 'Showed consistent attendance, punctuality, and remarkable grit.',
    defaultAge: 'All Ages',
  },
  {
    id: 'MS-AGI-01',
    title: 'First Solo Agility Drill',
    category: 'Skill Independence',
    program: 'Foundational Movement',
    iconType: 'flag',
    description: 'Completed the multi-station agility circuit independently without coach prompting.',
    defaultAge: 'Ages 3 – 5',
  },
  {
    id: 'MS-FT-CS10',
    title: '10 Clean Sheet Drills',
    category: 'Technical Mastery',
    program: 'Football',
    iconType: 'shield',
    description: 'Mastered 10 defensive coordination and positioning drills with zero errors.',
    defaultAge: 'Ages 5 – 12',
  },
  {
    id: 'MS-ATT-50',
    title: '50 Elite Sessions Spartan Star',
    category: 'Attendance & Dedication',
    program: 'All Programs',
    iconType: 'medal',
    description: 'Achieved 50 disciplined training sessions at Little Spartans Academy.',
    defaultAge: 'All Ages',
  },
];

/**
 * Initial mock data for student journeys
 */
export const INITIAL_CHILD_JOURNEYS = {
  // Aarav K (STU-LS-002) - Matches the uploaded screenshot
  'STU-LS-002': {
    childId: 'STU-LS-002',
    name: 'Aarav K',
    age: 5,
    gender: 'Male',
    batch: 'LE - B1',
    program: 'Foundational Movement',
    center: 'KK NAGAR',
    coachId: 'COACH-KARTHIK-N',
    coachName: 'Coach Karthik',
    coachTitle: 'Primary Coach',
    coachAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    overallProgress: 80,
    currentStage: 'Stage 2 – Movement Mastery',
    trailTitle: 'The Autumn Adventure',
    trailSubtitle: 'Four little discoveries. Three months of moving, connecting and growing.',
    trailPeriod: 'Oct – Dec 2026',
    progressMarker: {
      week: 6,
      totalWeeks: 12,
      date: 'Nov 12',
      label: 'Week 6 of 12 • Nov 12',
    },
    // The 5 badges placed on the Autumn Adventure pathway
    pathwayBadges: [
      {
        badgeId: 'BADGE-FM-JUMP',
        name: 'Jumping',
        category: 'Locomotor',
        iconType: 'rabbit',
        status: BADGE_STATUSES.COMPLETED,
        progress: 100,
        completedDate: 'Oct 10, 2026',
        completedDateShort: 'Oct 10',
        verified: true,
        verifiedBy: 'Super Coach Alex',
        verifiedDate: 'Oct 11, 2026',
        description: 'Learnt two-foot takeoff and safe, balanced landing without falling.',
        whatChildDid: [
          'Practised two-foot spring takeoff with balanced form',
          'Landed softly with knee absorption and no wobbling',
          'Maintained upright upper body posture throughout the jump',
        ],
      },
      {
        badgeId: 'BADGE-FM-TURNS',
        name: 'Taking Turns',
        category: 'Social & Emotional',
        iconType: 'fox_bear',
        status: BADGE_STATUSES.COMPLETED,
        progress: 100,
        completedDate: 'Oct 31, 2026',
        completedDateShort: 'Oct 31',
        verified: true,
        verifiedBy: 'Super Coach Alex',
        verifiedDate: 'Nov 01, 2026',
        description: 'Learnt to wait, share and give others a chance during games and activities.',
        whatChildDid: [
          'Waited for their turn during activities',
          'Shared equipment with friends',
          'Showed good teamwork and cooperation',
        ],
      },
      {
        badgeId: 'BADGE-FM-HOP',
        name: 'Hopping',
        category: 'Locomotor',
        iconType: 'duck',
        status: BADGE_STATUSES.IN_PROGRESS,
        progress: 60,
        completedDate: null,
        completedDateShort: null,
        verified: false,
        description: 'Mastering single-leg balance and continuous hops across the obstacle mat.',
        whatChildDid: [
          'Hopped 5 times on preferred right foot with steady balance',
          'Practised single-leg landing with soft knee flexion',
        ],
      },
      {
        badgeId: 'BADGE-FM-BAL',
        name: 'Balancing',
        category: 'Stability',
        iconType: 'beam_girl',
        status: BADGE_STATUSES.LOCKED,
        progress: 0,
        completedDate: null,
        completedDateShort: null,
        verified: false,
        description: 'Skill locked in curriculum. Unlocks in Week 8 of the Autumn Trail.',
        whatChildDid: [],
      },
      {
        badgeId: 'BADGE-FM-THROW',
        name: 'Throwing',
        category: 'Object Control',
        iconType: 'target',
        status: BADGE_STATUSES.LOCKED,
        progress: 0,
        completedDate: null,
        completedDateShort: null,
        verified: false,
        description: 'Skill locked in curriculum. Unlocks in Week 10 of the Autumn Trail.',
        whatChildDid: [],
      },
    ],
    // Total badges earned (grid of 6 in bottom row)
    earnedBadges: [
      {
        id: 'BADGE-FM-JUMP',
        name: 'Jumping',
        category: 'Locomotor',
        iconType: 'rabbit',
        date: 'Oct 10, 2026',
        color: '#10B981',
      },
      {
        id: 'BADGE-FM-TURNS',
        name: 'Taking Turns',
        category: 'Social & Emotional',
        iconType: 'fox_bear',
        date: 'Oct 31, 2026',
        color: '#F4510B',
      },
      {
        id: 'BADGE-FM-RUN',
        name: 'Running',
        category: 'Locomotor',
        iconType: 'sprinter',
        date: 'Sep 15, 2026',
        color: '#059669',
      },
      {
        id: 'BADGE-FM-SKIP',
        name: 'Skipping',
        category: 'Locomotor',
        iconType: 'rope_kid',
        date: 'Sep 28, 2026',
        color: '#D97706',
      },
      {
        id: 'BADGE-FM-STAR',
        name: 'Focus Star',
        category: 'Cognitive & Focus',
        iconType: 'star',
        date: 'Oct 15, 2026',
        color: '#F59E0B',
      },
      {
        id: 'BADGE-FM-TEAM',
        name: 'Team Player',
        category: 'Social',
        iconType: 'friends',
        date: 'Oct 22, 2026',
        color: '#3B82F6',
      },
    ],
    // Milestones unlocked (3 achieved in bottom row)
    milestones: [
      {
        id: 'MS-FM-L1',
        title: 'Level 1 Foundational Movement Complete',
        description: 'Successfully mastered basic motor skills.',
        achievedDate: 'Nov 15, 2026',
        verified: true,
        iconType: 'trophy',
        coach: 'Coach Karthik',
      },
      {
        id: 'MS-ATT-25',
        title: '25 Training Sessions Milestone',
        description: 'Showed consistent attendance and effort.',
        achievedDate: 'Nov 02, 2026',
        verified: true,
        iconType: 'star',
        coach: 'Coach Karthik',
      },
      {
        id: 'MS-AGI-01',
        title: 'First Solo Agility Drill',
        description: 'Completed the agility circuit independently.',
        achievedDate: 'Oct 18, 2026',
        verified: true,
        iconType: 'flag',
        coach: 'Coach Karthik',
      },
    ],
    // Radar Development Profile (Spider Chart)
    developmentProfile: {
      assessmentDate: 'Nov 10, 2026',
      verifiedBy: 'Super Coach Alex',
      verifiedDate: 'Nov 11, 2026',
      coachName: 'Coach Karthik',
      dimensions: {
        balance: 82,
        coordination: 78,
        agility: 80,
        strength: 70,
        flexibility: 75,
        stamina: 65,
        focus: 85,
        confidence: 82,
        instructions: 88,
      },
      previousDimensions: {
        balance: 65,
        coordination: 60,
        agility: 68,
        strength: 58,
        flexibility: 65,
        stamina: 55,
        focus: 70,
        confidence: 72,
        instructions: 75,
      },
      keyObservations: [
        'Good balance and body control',
        'Improved coordination and agility',
        'Shows great teamwork',
        'Needs a little more endurance',
      ],
      coachNotes:
        'Aarav is adapting wonderfully to group dynamics. His single-leg balance and hurdle jumps have seen remarkable progress this quarter. Highly attentive during coach demos.',
    },
    // Official Certificates (2 issued)
    certificates: [
      {
        id: 'CERT-LS-2026-089',
        certNumber: 'LS-CERT-2026-089',
        title: 'Foundational Movement Level 1 Certificate of Excellence',
        program: 'Foundational Movement',
        issueDate: 'Nov 16, 2026',
        issuedBy: 'Academy Technical Director',
        badgeTitle: 'Movement Mastery',
        verified: true,
        status: 'Issued & Verified',
        downloadUrl: '#',
      },
      {
        id: 'CERT-LS-2026-042',
        certNumber: 'LS-CERT-2026-042',
        title: 'Spartan Junior Agility Master',
        program: 'Foundational Movement',
        issueDate: 'Oct 20, 2026',
        issuedBy: 'Senior Head Coach',
        badgeTitle: 'Agility Circuit',
        verified: true,
        status: 'Issued & Verified',
        downloadUrl: '#',
      },
    ],
  },

  // Diya K (STU-LS-004) - Sibling child under parent Karthik K
  'STU-LS-004': {
    childId: 'STU-LS-004',
    name: 'Diya K',
    age: 7,
    gender: 'Female',
    batch: 'FB - B1',
    program: 'Football',
    center: 'KK NAGAR',
    coachId: 'COACH-SAM',
    coachName: 'Coach Sam',
    coachTitle: 'Lead Football Coach',
    coachAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    overallProgress: 68,
    currentStage: 'Stage 3 – Tactical Awareness',
    trailTitle: 'Junior Premier Football Trail',
    trailSubtitle: 'Five tactical milestones across the winter academy cup season.',
    trailPeriod: 'Oct – Dec 2026',
    progressMarker: {
      week: 7,
      totalWeeks: 12,
      date: 'Nov 19',
      label: 'Week 7 of 12 • Nov 19',
    },
    pathwayBadges: [
      {
        badgeId: 'BADGE-FT-DRIBBLE',
        name: 'Ball Master',
        category: 'Object Control',
        iconType: 'dribble',
        status: BADGE_STATUSES.COMPLETED,
        progress: 100,
        completedDate: 'Oct 14, 2026',
        completedDateShort: 'Oct 14',
        verified: true,
        verifiedBy: 'Super Coach Alex',
        verifiedDate: 'Oct 15, 2026',
        description: 'Close ball control with inside and outside of both feet through slalom cones.',
        whatChildDid: [
          'Slalomed through 6 cones with clean two-touch rhythm',
          'Executed sharp drag-back turns without losing ball custody',
          'Demonstrated confident dribble speed with chin up',
        ],
      },
      {
        badgeId: 'BADGE-FT-PASS',
        name: 'First Touch Pass',
        category: 'Teamwork',
        iconType: 'pass',
        status: BADGE_STATUSES.COMPLETED,
        progress: 100,
        completedDate: 'Nov 04, 2026',
        completedDateShort: 'Nov 04',
        verified: true,
        verifiedBy: 'Super Coach Alex',
        verifiedDate: 'Nov 05, 2026',
        description: 'Cushioned first touch reception followed by crisp side-foot pass to partner.',
        whatChildDid: [
          'Cushioned 8 out of 10 incoming rolling passes',
          'Delivered firm inside-of-foot return pass to teammate',
          'Showed excellent head check before receiving pass',
        ],
      },
      {
        badgeId: 'BADGE-FT-STRIKE',
        name: 'Target Striker',
        category: 'Object Control',
        iconType: 'target',
        status: BADGE_STATUSES.IN_PROGRESS,
        progress: 75,
        completedDate: null,
        completedDateShort: null,
        verified: false,
        description: 'Instep drive and placed shots into lower corners of mini target goal.',
        whatChildDid: [
          'Practised non-kicking plant foot positioning beside ball',
          'Struck 3 shots into bottom left corner netting',
        ],
      },
      {
        badgeId: 'BADGE-FT-SHIELD',
        name: 'Defender Wall',
        category: 'Agility & Tactics',
        iconType: 'shield',
        status: BADGE_STATUSES.LOCKED,
        progress: 0,
        completedDate: null,
        completedDateShort: null,
        verified: false,
        description: 'Locked in curriculum. Unlocks in Week 9 of the Football Trail.',
        whatChildDid: [],
      },
      {
        badgeId: 'BADGE-FT-PLAY',
        name: 'Fair Play Hero',
        category: 'Social & Emotional',
        iconType: 'handshake',
        status: BADGE_STATUSES.LOCKED,
        progress: 0,
        completedDate: null,
        completedDateShort: null,
        verified: false,
        description: 'Locked in curriculum. Evaluated during tournament week.',
        whatChildDid: [],
      },
    ],
    earnedBadges: [
      {
        id: 'BADGE-FT-DRIBBLE',
        name: 'Ball Master',
        category: 'Object Control',
        iconType: 'dribble',
        date: 'Oct 14, 2026',
        color: '#10B981',
      },
      {
        id: 'BADGE-FT-PASS',
        name: 'First Touch Pass',
        category: 'Teamwork',
        iconType: 'pass',
        date: 'Nov 04, 2026',
        color: '#3B82F6',
      },
      {
        id: 'BADGE-ATH-SPRINT',
        name: 'Speed Sprint',
        category: 'Speed',
        iconType: 'sprinter',
        date: 'Sep 20, 2026',
        color: '#EF4444',
      },
      {
        id: 'BADGE-FM-TEAM',
        name: 'Team Spirit',
        category: 'Social',
        iconType: 'friends',
        date: 'Oct 02, 2026',
        color: '#F59E0B',
      },
    ],
    milestones: [
      {
        id: 'MS-FT-CS10',
        title: '10 Clean Sheet Drills',
        description: 'Mastered defensive coordination and positioning drills.',
        achievedDate: 'Nov 12, 2026',
        verified: true,
        iconType: 'shield',
        coach: 'Coach Sam',
      },
      {
        id: 'MS-ATT-25',
        title: '20 Training Sessions Milestone',
        description: 'Showed dedicated weekend attendance and grit.',
        achievedDate: 'Oct 26, 2026',
        verified: true,
        iconType: 'star',
        coach: 'Coach Sam',
      },
    ],
    developmentProfile: {
      assessmentDate: 'Nov 14, 2026',
      verifiedBy: 'Super Coach Alex',
      verifiedDate: 'Nov 15, 2026',
      coachName: 'Coach Sam',
      dimensions: {
        balance: 75,
        coordination: 85,
        agility: 82,
        strength: 78,
        flexibility: 70,
        stamina: 82,
        focus: 78,
        confidence: 86,
        instructions: 82,
      },
      previousDimensions: {
        balance: 62,
        coordination: 70,
        agility: 72,
        strength: 65,
        flexibility: 60,
        stamina: 70,
        focus: 68,
        confidence: 74,
        instructions: 76,
      },
      keyObservations: [
        'High stamina and explosive speed',
        'Excellent passing accuracy and vision',
        'Shows great leadership on field',
        'Working on weak-foot ball reception',
      ],
      coachNotes:
        'Diya shows natural aptitude for tactical passing. Her stamina during high-tempo scrimmages is among the best in the batch.',
    },
    certificates: [
      {
        id: 'CERT-LS-2026-056',
        certNumber: 'LS-CERT-2026-056',
        title: 'Grassroots Football Junior Star Certificate',
        program: 'Football',
        issueDate: 'Oct 25, 2026',
        issuedBy: 'Football Technical Director',
        badgeTitle: 'Ball Control Excellence',
        verified: true,
        status: 'Issued & Verified',
        downloadUrl: '#',
      },
    ],
  },
};

/**
 * Initial submissions queue for Coach -> Super Coach verification
 */
export const INITIAL_DEVELOPMENT_SUBMISSIONS = [
  {
    id: 'SUB-DEV-101',
    type: 'badge',
    badgeId: 'BADGE-FM-HOP',
    badgeName: 'Hopping',
    category: 'Locomotor',
    childId: 'STU-LS-002',
    childName: 'Aarav K',
    childAge: 5,
    childAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    program: 'Foundational Movement',
    batch: 'LE - B1',
    location: 'KK NAGAR',
    coachId: 'COACH-KARTHIK-N',
    coachName: 'Coach Karthik',
    sessionDate: '2026-11-25',
    status: SUBMISSION_STATUSES.PENDING,
    submittedAt: '2026-11-25T16:30:00Z',
    evidenceNotes:
      'Aarav completed 8 consecutive hops on right foot and 6 on left foot over the foam beam. Great balance stabilization.',
    whatChildDemonstrated: [
      'Hopped across 4 floor targets on right foot steadily',
      'Demonstrated soft landing without floor hand-touch',
      'Exceeded 5-second single leg stance balance benchmark',
    ],
    auditTrail: [
      {
        action: 'Submission Created',
        performer: 'Coach Karthik (Primary Coach)',
        timestamp: '2026-11-25 16:30',
        note: 'Submitted badge for Super Coach review after today\'s session.',
      },
    ],
  },
  {
    id: 'SUB-DEV-102',
    type: 'milestone',
    milestoneId: 'MS-FM-L1',
    milestoneTitle: 'Level 1 Foundational Movement Complete',
    childId: 'STU-LS-002',
    childName: 'Aarav K',
    childAge: 5,
    childAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    program: 'Foundational Movement',
    batch: 'LE - B1',
    location: 'KK NAGAR',
    coachId: 'COACH-KARTHIK-N',
    coachName: 'Coach Karthik',
    sessionDate: '2026-11-20',
    status: SUBMISSION_STATUSES.APPROVED,
    submittedAt: '2026-11-20T17:00:00Z',
    reviewedAt: '2026-11-21T10:15:00Z',
    reviewedBy: 'Super Coach Alex',
    reviewNotes: 'Verified during on-site academy visit. Excellent form and motor competence.',
    evidenceNotes:
      'Completed all 4 fundamental movement stations (jumping, balance, throwing, running) with full marks.',
    auditTrail: [
      {
        action: 'Submitted',
        performer: 'Coach Karthik',
        timestamp: '2026-11-20 17:00',
        note: 'Submitted after end-of-stage testing.',
      },
      {
        action: 'Approved & Verified',
        performer: 'Super Coach Alex',
        timestamp: '2026-11-21 10:15',
        note: 'Verified during on-site academy visit. Published to Parent Portal.',
      },
    ],
  },
  {
    id: 'SUB-DEV-103',
    type: 'badge',
    badgeId: 'BADGE-FT-STRIKE',
    badgeName: 'Target Striker',
    category: 'Object Control',
    childId: 'STU-LS-004',
    childName: 'Diya K',
    childAge: 7,
    childAvatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80',
    program: 'Football',
    batch: 'FB - B1',
    location: 'KK NAGAR',
    coachId: 'COACH-SAM',
    coachName: 'Coach Sam',
    sessionDate: '2026-11-24',
    status: SUBMISSION_STATUSES.PENDING,
    submittedAt: '2026-11-24T18:00:00Z',
    evidenceNotes:
      'Diya scored 4 out of 5 target shots from 10 metres. Strong instep drive mechanics.',
    whatChildDemonstrated: [
      'Placed 4 accurate shots into bottom corner pockets',
      'Proper follow-through and body angle over the ball',
    ],
    auditTrail: [
      {
        action: 'Submission Created',
        performer: 'Coach Sam',
        timestamp: '2026-11-24 18:00',
        note: 'Ready for Super Coach review.',
      },
    ],
  },
];

/**
 * Calculates SVG Radar Chart coordinates (polygon points and radial web lines)
 */
export function getRadarCoordinates(dimensions, centerX = 100, centerY = 100, maxRadius = 70) {
  const keys = RADAR_DIMENSIONS.map((d) => d.key);
  const total = keys.length;
  const angleStep = (Math.PI * 2) / total;
  // Rotate so first dimension is at top (-PI / 2)
  const startAngle = -Math.PI / 2;

  // Web spokes and labels
  const spokes = keys.map((key, i) => {
    const angle = startAngle + i * angleStep;
    const xOuter = centerX + Math.cos(angle) * maxRadius;
    const yOuter = centerY + Math.sin(angle) * maxRadius;
    const xLabel = centerX + Math.cos(angle) * (maxRadius + 16);
    const yLabel = centerY + Math.sin(angle) * (maxRadius + 16);
    const def = RADAR_DIMENSIONS.find((d) => d.key === key);
    return {
      key,
      label: def?.label || key,
      angle,
      xOuter,
      yOuter,
      xLabel,
      yLabel,
    };
  });

  // Concentric polygon web levels (20%, 40%, 60%, 80%, 100%)
  const webLevels = [0.2, 0.4, 0.6, 0.8, 1.0].map((levelPct) => {
    const points = keys
      .map((_, i) => {
        const angle = startAngle + i * angleStep;
        const r = maxRadius * levelPct;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
    return { levelPct, points };
  });

  // Calculate polygon points for a given dimension scores object
  const getPolygonPoints = (scores = {}) => {
    return keys
      .map((key, i) => {
        const angle = startAngle + i * angleStep;
        const val = Math.max(0, Math.min(100, scores[key] ?? 70));
        const r = (val / 100) * maxRadius;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  return {
    spokes,
    webLevels,
    getPolygonPoints,
  };
}

/**
 * Calculates overall progress percentage based on completed and in-progress badges
 */
export function calculateOverallProgress(pathwayBadges = []) {
  if (!pathwayBadges || pathwayBadges.length === 0) return 0;
  const total = pathwayBadges.length;
  let earnedPoints = 0;
  pathwayBadges.forEach((b) => {
    if (b.status === BADGE_STATUSES.COMPLETED) {
      earnedPoints += 100;
    } else if (b.status === BADGE_STATUSES.IN_PROGRESS) {
      earnedPoints += b.progress || 50;
    }
  });
  return Math.min(100, Math.round(earnedPoints / total));
}
