const { MESSAGE_CATALOG, CONVENTIONAL_PREFIXES } = require("./catalog");

/**
 * MessageGenerator produces coherent, categorized, realistic commit messages.
 * Prevents immediate or frequent repetitions using a cooldown buffer,
 * avoids category starvation/monotony, and optionally formats as Conventional Commits.
 */
class MessageGenerator {
  /**
   * @param {Object} options
   * @param {boolean} [options.conventional=false] - Whether to prefix with Conventional Commits format (feat:, fix:, etc.)
   * @param {number} [options.cooldownSize=50] - Number of recent messages to keep in cooldown
   */
  constructor({ conventional = false, cooldownSize = 50 } = {}) {
    this.conventional = Boolean(conventional);
    this.cooldownSize = cooldownSize;
    this.recentMessages = [];
    this.recentCategories = [];
    this.commitIndex = 0;

    // Track usage count per message to prioritize unused messages
    this.usageCounts = new Map();
  }

  /**
   * Formats a raw message according to conventional commits if enabled.
   * @param {string} rawMessage
   * @param {string} category
   * @returns {string}
   */
  formatMessage(rawMessage, category) {
    if (!this.conventional) {
      return rawMessage;
    }

    const prefix = CONVENTIONAL_PREFIXES[category] || "chore";
    // Lowercase first letter of message for conventional commit style
    const description =
      rawMessage.charAt(0).toLowerCase() + rawMessage.slice(1);
    return `${prefix}: ${description}`;
  }

  /**
   * Selects an appropriate category based on commit index and recent category history.
   * Models realistic project development lifecycle:
   * - Phase 1 (Initial commits): Setup and initial scaffold
   * - Phase 2 (Foundation): Features, docs, tests
   * - Phase 3 (Ongoing): Balanced iteration between features, tests, fixes, refactor, docs, config, quality
   * @param {number} [progressRatio=0] - 0.0 to 1.0 representing timeline progress
   * @param {string} [preferredCategory]
   * @returns {string}
   */
  selectCategory(progressRatio = 0, preferredCategory = null) {
    if (preferredCategory && MESSAGE_CATALOG[preferredCategory]) {
      return preferredCategory;
    }

    // Lifecycle-driven category weighting
    let weights;

    if (this.commitIndex === 0) {
      return "setup";
    } else if (this.commitIndex < 4) {
      weights = {
        setup: 35,
        features: 30,
        docs: 25,
        config: 10,
        testing: 0,
        fixes: 0,
        refactor: 0,
        quality: 0
      };
    } else if (this.commitIndex < 12) {
      weights = {
        features: 35,
        testing: 20,
        docs: 15,
        fixes: 10,
        setup: 5,
        refactor: 5,
        config: 5,
        quality: 5
      };
    } else {
      // Mature project phase with natural distribution
      weights = {
        features: 25,
        fixes: 20,
        testing: 18,
        refactor: 14,
        docs: 10,
        quality: 7,
        config: 5,
        setup: 1
      };

      // Slight shift for late lifecycle / long-running maintenance
      if (progressRatio > 0.75) {
        weights.fixes += 5;
        weights.refactor += 3;
        weights.config += 4;
        weights.features -= 10;
      }
    }

    // Penalize recently used categories to prevent consecutive runs of same category
    const lastCategory = this.recentCategories[
      this.recentCategories.length - 1
    ];
    const secondLastCategory = this.recentCategories[
      this.recentCategories.length - 2
    ];

    if (lastCategory && weights[lastCategory]) {
      weights[lastCategory] = Math.max(
        1,
        Math.floor(weights[lastCategory] * 0.25)
      );
    }
    if (secondLastCategory && weights[secondLastCategory]) {
      weights[secondLastCategory] = Math.max(
        1,
        Math.floor(weights[secondLastCategory] * 0.5)
      );
    }

    // Select category based on adjusted weights
    const categories = Object.keys(weights);
    const totalWeight = categories.reduce(
      (sum, cat) => sum + (weights[cat] || 0),
      0
    );
    let randomVal = Math.random() * totalWeight;

    for (const cat of categories) {
      randomVal -= weights[cat] || 0;
      if (randomVal <= 0) {
        return cat;
      }
    }

    return "features";
  }

  /**
   * Generates the next commit message in the synthetic progression.
   * @param {Object} [options]
   * @param {number} [options.progressRatio=0] - Timeline progress (0.0 - 1.0)
   * @param {string} [options.preferredCategory] - Optional explicit category
   * @returns {{ category: string, message: string, rawMessage: string, commitIndex: number }}
   */
  nextCommit({ progressRatio = 0, preferredCategory = null } = {}) {
    const category = this.selectCategory(progressRatio, preferredCategory);
    const pool = MESSAGE_CATALOG[category] || MESSAGE_CATALOG.features;

    // Filter out messages that are currently in the cooldown list
    const cooldownSet = new Set(this.recentMessages);
    let available = pool.filter(msg => !cooldownSet.has(msg));

    // If all messages in this category are in cooldown, pick least frequently used
    if (available.length === 0) {
      available = [...pool].sort(
        (a, b) =>
          (this.usageCounts.get(a) || 0) - (this.usageCounts.get(b) || 0)
      );
    }

    // Pick a message, preferring lower usage counts
    const lowestUsage = Math.min(
      ...available.map(m => this.usageCounts.get(m) || 0)
    );
    const candidatePool = available.filter(
      m => (this.usageCounts.get(m) || 0) <= lowestUsage + 1
    );

    const rawMessage =
      candidatePool[Math.floor(Math.random() * candidatePool.length)];

    // Record usage
    this.usageCounts.set(
      rawMessage,
      (this.usageCounts.get(rawMessage) || 0) + 1
    );

    // Update cooldown buffer
    this.recentMessages.push(rawMessage);
    if (this.recentMessages.length > this.cooldownSize) {
      this.recentMessages.shift();
    }

    // Update recent categories
    this.recentCategories.push(category);
    if (this.recentCategories.length > 5) {
      this.recentCategories.shift();
    }

    const message = this.formatMessage(rawMessage, category);
    const currentCommitIndex = this.commitIndex;
    this.commitIndex++;

    return {
      category,
      message,
      rawMessage,
      commitIndex: currentCommitIndex
    };
  }

  /**
   * Reset generator state
   */
  reset() {
    this.recentMessages = [];
    this.recentCategories = [];
    this.usageCounts.clear();
    this.commitIndex = 0;
  }
}

module.exports = {
  MessageGenerator
};
