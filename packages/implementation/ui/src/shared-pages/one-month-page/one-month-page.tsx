import { OneMonthStory } from './one-month-story.js';

/**
 * `/for/spooky/one-month/`: how we started, told card by card, from a plan
 * that met some things to a salsa night. A shared page: English only,
 * reached by its link alone, and dressed in its own palette (`one-month.css`).
 */
export function OneMonthPageView() {
  return (
    <main className="month-page">
      <OneMonthStory />
    </main>
  );
}
