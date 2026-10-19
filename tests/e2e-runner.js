/**
 * E2E Runner & Assertion Framework for Ad Preview Application
 * Browser-executable, lightweight, zero external dependencies.
 */

class AssertionError extends Error {
  constructor(message, actual, expected) {
    super(message);
    this.name = 'AssertionError';
    this.actual = actual;
    this.expected = expected;
  }
}

export class Matcher {
  constructor(actual) {
    this.actual = actual;
  }

  toBe(expected) {
    if (this.actual !== expected) {
      throw new AssertionError(
        `Expected ${JSON.stringify(this.actual)} to be ${JSON.stringify(expected)}`,
        this.actual,
        expected
      );
    }
  }

  toEqual(expected) {
    const actStr = JSON.stringify(this.actual);
    const expStr = JSON.stringify(expected);
    if (actStr !== expStr) {
      throw new AssertionError(
        `Expected deep equality:\nActual:   ${actStr}\nExpected: ${expStr}`,
        this.actual,
        expected
      );
    }
  }

  toContain(expected) {
    if (typeof this.actual === 'string' || Array.isArray(this.actual)) {
      if (!this.actual.includes(expected)) {
        throw new AssertionError(
          `Expected ${JSON.stringify(this.actual)} to contain ${JSON.stringify(expected)}`,
          this.actual,
          expected
        );
      }
    } else {
      throw new AssertionError(`Cannot call toContain on ${typeof this.actual}`, this.actual, expected);
    }
  }

  toBeGreaterThan(expected) {
    if (!(this.actual > expected)) {
      throw new AssertionError(
        `Expected ${this.actual} to be greater than ${expected}`,
        this.actual,
        expected
      );
    }
  }

  toBeLessThan(expected) {
    if (!(this.actual < expected)) {
      throw new AssertionError(
        `Expected ${this.actual} to be less than ${expected}`,
        this.actual,
        expected
      );
    }
  }

  toBeCloseTo(expected, delta = 0.01) {
    if (Math.abs(this.actual - expected) > delta) {
      throw new AssertionError(
        `Expected ${this.actual} to be close to ${expected} within delta ${delta}`,
        this.actual,
        expected
      );
    }
  }

  toExist() {
    if (this.actual === null || this.actual === undefined) {
      throw new AssertionError(`Expected element or value to exist, but got ${this.actual}`, this.actual, 'exists');
    }
  }

  toHaveLength(expected) {
    const len = this.actual ? this.actual.length : undefined;
    if (len !== expected) {
      throw new AssertionError(
        `Expected length ${expected}, but got ${len}`,
        len,
        expected
      );
    }
  }

  toHaveText(expectedSubstring) {
    this.toExist();
    const text = this.actual.textContent || '';
    if (!text.includes(expectedSubstring)) {
      throw new AssertionError(
        `Expected element text to contain "${expectedSubstring}", but got: "${text.trim().slice(0, 100)}"`,
        text,
        expectedSubstring
      );
    }
  }

  toHaveClass(className) {
    this.toExist();
    const classes = this.actual.className || '';
    const classList = typeof classes === 'string' ? classes.split(/\s+/) : [];
    if (!classList.includes(className)) {
      throw new AssertionError(
        `Expected element to have class "${className}", but got classes: "${classes}"`,
        classes,
        className
      );
    }
  }

  toHaveComputedStyle(property, expectedValue) {
    this.toExist();
    const win = this.actual.ownerDocument ? this.actual.ownerDocument.defaultView : window;
    const computed = win.getComputedStyle(this.actual).getPropertyValue(property);
    if (!computed.includes(expectedValue)) {
      throw new AssertionError(
        `Expected computed style "${property}" to match "${expectedValue}", but got "${computed}"`,
        computed,
        expectedValue
      );
    }
  }
}

export function expect(actual) {
  return new Matcher(actual);
}

export class TestRunner {
  constructor() {
    this.suites = [];
    this.currentSuite = null;
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      durationMs: 0,
      consoleErrors: [],
      zeroConsoleErrors: true,
      tiers: {
        tier1: { total: 0, passed: 0, failed: 0 },
        tier2: { total: 0, passed: 0, failed: 0 },
        tier3: { total: 0, passed: 0, failed: 0 },
        tier4: { total: 0, passed: 0, failed: 0 },
      },
      details: [],
    };
    this.onTestStart = null;
    this.onTestEnd = null;
    this.onSuiteEnd = null;
  }

  describe(tier, suiteName, fn) {
    const suite = {
      tier,
      name: suiteName,
      tests: [],
      beforeEachFns: [],
      afterEachFns: [],
    };
    this.suites.push(suite);
    const prevSuite = this.currentSuite;
    this.currentSuite = suite;

    try {
      fn();
    } finally {
      this.currentSuite = prevSuite;
    }
  }

  it(name, testFn) {
    if (!this.currentSuite) {
      throw new Error('it() must be called inside a describe() block');
    }
    this.currentSuite.tests.push({
      name,
      fn: testFn,
    });
  }

  beforeEach(fn) {
    if (this.currentSuite) {
      this.currentSuite.beforeEachFns.push(fn);
    }
  }

  afterEach(fn) {
    if (this.currentSuite) {
      this.currentSuite.afterEachFns.push(fn);
    }
  }

  async run(tierFilter = null, targetDocument = null) {
    const startTime = Date.now();
    this.results.total = 0;
    this.results.passed = 0;
    this.results.failed = 0;
    this.results.details = [];

    // Intercept console errors on target
    const targetWin = targetDocument ? targetDocument.defaultView : (typeof window !== 'undefined' ? window : null);
    if (targetWin && targetWin.console) {
      const origError = targetWin.console.error;
      targetWin.console.error = (...args) => {
        const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
        this.results.consoleErrors.push(msg);
        this.results.zeroConsoleErrors = false;
        origError.apply(targetWin.console, args);
      };
    }

    for (const suite of this.suites) {
      if (tierFilter && suite.tier !== tierFilter) {
        continue;
      }

      for (const test of suite.tests) {
        this.results.total += 1;
        const tierObj = this.results.tiers[suite.tier] || { total: 0, passed: 0, failed: 0 };
        tierObj.total += 1;

        if (this.onTestStart) {
          this.onTestStart(suite, test);
        }

        const testRecord = {
          tier: suite.tier,
          suite: suite.name,
          name: test.name,
          passed: false,
          error: null,
          durationMs: 0,
        };

        const tStart = Date.now();
        try {
          for (const bf of suite.beforeEachFns) {
            await bf(targetDocument);
          }
          await test.fn(targetDocument);
          for (const af of suite.afterEachFns) {
            await af(targetDocument);
          }
          testRecord.passed = true;
          this.results.passed += 1;
          tierObj.passed += 1;
        } catch (err) {
          testRecord.passed = false;
          testRecord.error = err.message || String(err);
          this.results.failed += 1;
          tierObj.failed += 1;
        }
        testRecord.durationMs = Date.now() - tStart;
        this.results.details.push(testRecord);

        if (this.onTestEnd) {
          this.onTestEnd(suite, test, testRecord);
        }
      }
    }

    this.results.durationMs = Date.now() - startTime;
    this.results.zeroConsoleErrors = this.results.consoleErrors.length === 0;

    if (typeof window !== 'undefined') {
      window.__TEST_RESULTS__ = this.results;
    }

    if (this.onSuiteEnd) {
      this.onSuiteEnd(this.results);
    }

    return this.results;
  }
}

// Global runner singleton
export const runner = new TestRunner();
export const describe = (tier, name, fn) => runner.describe(tier, name, fn);
export const it = (name, fn) => runner.it(name, fn);
export const beforeEach = (fn) => runner.beforeEach(fn);
export const afterEach = (fn) => runner.afterEach(fn);

/**
 * DOM Utility helpers for UI interaction in iframe or DOM document
 */
export const dom = {
  get(doc, selector) {
    return (doc || document).querySelector(selector);
  },
  getAll(doc, selector) {
    return Array.from((doc || document).querySelectorAll(selector));
  },
  click(element) {
    if (!element) throw new Error('Cannot click null element');
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  },
  type(inputElement, text) {
    if (!inputElement) throw new Error('Cannot type in null element');
    inputElement.focus();
    inputElement.value = text;
    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    inputElement.dispatchEvent(new Event('change', { bubbles: true }));
  },
  select(selectElement, value) {
    if (!selectElement) throw new Error('Cannot select on null element');
    selectElement.value = value;
    selectElement.dispatchEvent(new Event('change', { bubbles: true }));
  },
  getStyle(element, prop) {
    if (!element) return '';
    const win = element.ownerDocument ? element.ownerDocument.defaultView : window;
    return win.getComputedStyle(element).getPropertyValue(prop);
  }
};
