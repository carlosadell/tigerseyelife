delete from microlearning_modules
where tiiny_url like 'https://example.tiiny.site/%';

insert into microlearning_modules
  (block, title, description, tiiny_url, sort_order)
values
('ADAPT', 'ADAPT Block Orientation', 'Start the ADAPT block and learn the resilience frame.', 'https://adapt-block-orientation.tiiny.site/', 1),
('ADAPT', 'Backstop Protocol', 'A simple protocol for catching stress before it becomes a slide.', 'https://adapt-backstop-protocol.tiiny.site/', 2),
('ADAPT', 'Breath for Resilience', 'Use breath as a fast body-based reset under pressure.', 'https://adapt-breath-for-resilience.tiiny.site/', 3),
('ADAPT', 'Build Optionality', 'Create more than one path when the day does not cooperate.', 'https://adapt-build-optionality.tiiny.site/', 4),
('ADAPT', 'Growth Response Reframes', 'Practice reframes that turn friction into useful data.', 'https://adapt-growth-response-reframes.tiiny.site/', 5),
('ADAPT', 'Stress Testing Your Systems', 'Pressure-test the routines that support your energy and choices.', 'https://adapt-stress-testing-your-systems.tiiny.site/', 6),
('REFINE', 'REFINE Block Orientation', 'Start the REFINE block and sharpen your next decision.', 'https://refine-block-orientation.tiiny.site/', 7),
('REFINE', 'Wind-down Routine Strategies', 'Build an evening routine that protects recovery.', 'https://refine-wind-down-routine-strategies.tiiny.site/', 8),
('REFINE', 'Emotional Cycle of Change', 'Understand the emotional arc behind behavior change.', 'https://refine-emotional-cycle-of-change.tiiny.site/', 9),
('REFINE', 'Advocacy Boundaries', 'Use boundaries to protect what matters without overexplaining.', 'https://refine-advocacy-boundaries.tiiny.site/', 10),
('COMMIT', 'COMMIT Block Orientation', 'Start the COMMIT block and turn intention into repeatable action.', 'https://commit-block-orientation.tiiny.site/', 11),
('COMMIT', 'First Meal Quickstart', 'Make the first meal easier, clearer, and more protein-forward.', 'https://commit-first-meal-quickstart.tiiny.site/', 12),
('COMMIT', 'Sugar Identifier Guide', 'Learn where sugar patterns hide and how to spot them.', 'https://commit-sugar-identifier-guide.tiiny.site/', 13),
('COMMIT', '5 Universal Patterns', 'Recognize common patterns that shape daily food and energy choices.', 'https://commit-5-universal-patterns.tiiny.site/', 14),
('COMMIT', 'Progressive Overload Primer', 'Understand the strength principle behind smart progress.', 'https://commit-progressive-overload-primer.tiiny.site/', 15),
('EVOLVE', 'EVOLVE Block Orientation', 'Start the EVOLVE block and integrate new habits into identity.', 'https://evolve-block-orientation.tiiny.site/', 16),
('EVOLVE', 'Social Situation Scripts', 'Use simple scripts to navigate pressure without losing the plan.', 'https://social-situation-scripts.tiiny.site/', 17),
('EVOLVE', 'Eating to 80 Percent Full', 'Practice stopping with enough instead of stuffed.', 'https://evolve-eating-to-80-percent-full.tiiny.site/', 18),
('EVOLVE', 'Social Pattern Navigation', 'Spot social patterns and choose your response with intention.', 'https://evolve-social-pattern-navigation.tiiny.site/', 19),
('EVOLVE', '3 Accounts, 1 Economy', 'Balance energy, attention, and choices as one operating system.', 'https://evolve-3-accounts-1-economy.tiiny.site/', 20),
('EVOLVE', 'Identity Integration', 'Make the new behavior part of who you are becoming.', 'https://evolve-identity-integration.tiiny.site/', 21),
('FOUNDATIONS', 'The TEB Loop', 'Connect thoughts, emotions, and behaviors as a practical loop.', 'https://the-teb-loop.tiiny.site/', 22),
('APP', 'App v3 Preview', 'Reference experience for the next member-app direction.', 'https://app-v3.tiiny.site/', 23),
('FOUNDATIONS', 'Nutrition Foundations Guide', 'A grounding guide for nutrition choices without noise.', 'https://nutrition-foundations-guide.tiiny.site/', 24),
('FOUNDATIONS', 'Environment Design', 'Shape the environment so better choices become easier.', 'https://environment-design.tiiny.site/', 25),
('FOUNDATIONS', 'ABC Power Meals', 'A practical meal frame for strength, energy, and consistency.', 'https://abc-power-meals.tiiny.site/', 26);
