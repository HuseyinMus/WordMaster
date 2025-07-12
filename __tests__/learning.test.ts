import { SpacedRepetitionService } from '../src/services/spacedRepetition';

describe('Learning', () => {
  it('should calculate next review date', () => {
    const result = SpacedRepetitionService.calculateNextReview(5, 1, 2.5, 0);
    expect(result.interval).toBeGreaterThan(0);
    expect(result.nextReviewDate).toBeDefined();
  });
}); 