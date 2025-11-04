/**
 * KeyboardController manages all keyboard input and typing logic.
 * It handles targeting, character input validation, and word completion.
 * GameController only needs to provide callbacks for game events.
 */
export class KeyboardController {
	private handler: ((e: KeyboardEvent) => void) | null = null;
	
	// Typing state
	private typedText = "";
	private targetedIds: number[] = [];
	
	// Callbacks for game events
	private onTextUpdate: (text: string) => void;
	private onTargetsAcquired: (ids: number[], word: string) => void;
	private onTargetsCleared: () => void;
	private onWordComplete: (id: number) => void;
	private onProgressUpdate: (id: number, matchedText: string, unmatchedText: string) => void;
	private onHighlightClosest: (closestId: number | null) => void;
	private getWordForId: (id: number) => string | undefined;
	private getIdsForInitial: (char: string) => number[];
	private getClosestMatchingEnemy: (ids: number[], typedText: string) => number | null;
	private getAllEnemyIds: () => number[];

	constructor(callbacks: {
		onTextUpdate: (text: string) => void;
		onTargetsAcquired: (ids: number[], word: string) => void;
		onTargetsCleared: () => void;
		onWordComplete: (id: number) => void;
		onProgressUpdate: (id: number, matchedText: string, unmatchedText: string) => void;
		onHighlightClosest: (closestId: number | null) => void;
		getWordForId: (id: number) => string | undefined;
		getIdsForInitial: (char: string) => number[];
		getClosestMatchingEnemy: (ids: number[], typedText: string) => number | null;
		getAllEnemyIds: () => number[];
	}) {
		this.onTextUpdate = callbacks.onTextUpdate;
		this.onTargetsAcquired = callbacks.onTargetsAcquired;
		this.onTargetsCleared = callbacks.onTargetsCleared;
		this.onWordComplete = callbacks.onWordComplete;
		this.onProgressUpdate = callbacks.onProgressUpdate;
		this.onHighlightClosest = callbacks.onHighlightClosest;
		this.getWordForId = callbacks.getWordForId;
		this.getIdsForInitial = callbacks.getIdsForInitial;
		this.getClosestMatchingEnemy = callbacks.getClosestMatchingEnemy;
		this.getAllEnemyIds = callbacks.getAllEnemyIds;
	}

	/**
	 * Start listening for keyboard input
	 */
	start(): void {
		if (this.handler) return; // already started
		this.handler = (e: KeyboardEvent) => {
			if (e.key === "Backspace") {
				this.handleBackspace();
				return;
			}
			if (e.key === " " || e.key === "Spacebar") {
				this.handleSpaceBar();
				return;
			}
			if (e.key.length !== 1) return;
			this.handleCharacterInput(e.key.toLowerCase());
		};
		window.addEventListener("keydown", this.handler);
	}

	/**
	 * Stop listening for keyboard input
	 */
	stop(): void {
		if (!this.handler) return;
		window.removeEventListener("keydown", this.handler);
		this.handler = null;
	}

	/**
	 * Reset typing state (called when game resets or target is defeated)
	 */
	reset(): void {
		this.typedText = "";
		this.targetedIds = [];
	}

	/**
	 * Get current typed text
	 */
	getTypedText(): string {
		return this.typedText;
	}

	/**
	 * Get current targeted enemy ID
	 */
	getTargetedIds(): number[] | null {
		return (this.targetedIds.length > 0) ? this.targetedIds : null;
	}

	/**
	 * Handle backspace key press
	 */
	private handleBackspace(): void {
		if (this.targetedIds.length > 0) {
			this.typedText = this.typedText.slice(0, -1);
			this.onTextUpdate(this.typedText);
			this.updateProgressForTargets();
			
			if (this.typedText.length === 0) {
				this.onTargetsCleared();
				this.targetedIds = [];
			}
		}
	}

	/**
	 * Update progress for all enemies and highlight the closest matching one
	 */
	private updateProgressForTargets(): void {
		const allEnemyIds = this.getAllEnemyIds();
		let closestMatchingId: number | null = null;
		
		// Update progress for all enemies
		for (const id of allEnemyIds) {
			const word = this.getWordForId(id);
			if (!word) continue;
			
			const { matched, unmatched } = this.calculateMatch(word, this.typedText);
			this.onProgressUpdate(id, matched, unmatched);
		}
		
		// Find and highlight the closest matching enemy among targeted enemies
		if (this.targetedIds.length > 0 && this.typedText.length > 0) {
			closestMatchingId = this.getClosestMatchingEnemy(this.targetedIds, this.typedText);
		}
		
		this.onHighlightClosest(closestMatchingId);
	}

	/**
	 * Calculate matched and unmatched portions of a word
	 * Matches from index 0 to the first mismatch
	 */
	private calculateMatch(word: string, typed: string): { matched: string; unmatched: string } {
		const wordLower = word.toLowerCase();
		const typedLower = typed.toLowerCase();
		
		let matchLength = 0;
		for (let i = 0; i < Math.min(wordLower.length, typedLower.length); i++) {
			if (wordLower[i] === typedLower[i]) {
				matchLength++;
			} else {
				break; // Stop at first mismatch
			}
		}
		
		return {
			matched: word.slice(0, matchLength),
			unmatched: word.slice(matchLength)
		};
	}

	/**
	 * Handle character input
	 */
	private handleCharacterInput(char: string): void {
		// Acquire targets if none selected
		if (this.targetedIds.length === 0) {
			const ids = this.getIdsForInitial(char);
			if (ids.length === 0) return; // No enemy with that initial
			
			// Get the word from the first matching enemy (they should all have same initial)
			const word = this.getWordForId(ids[0]);
			if (!word) return;
			
			this.targetedIds = ids;
			this.typedText = char;
			this.onTargetsAcquired(ids, word);
			this.onTextUpdate(this.typedText);
			this.updateProgressForTargets();
			// Don't auto-complete, wait for space bar
			return;
		}

		// Progress existing targets - find closest matching enemy
		const nextTyped = this.typedText + char;
		const closestId = this.getClosestMatchingEnemy(this.targetedIds, nextTyped);
		
		if (closestId === null) {
			return; // No matching enemy for this character
		}

		const word = this.getWordForId(closestId);
		if (!word) return;

		// Update to only target the closest matching enemy
		this.targetedIds = [closestId];
		this.typedText = nextTyped;
		this.onTextUpdate(this.typedText);
		this.updateProgressForTargets();
		// Don't auto-complete, wait for space bar
	}

	/**
	 * Handle space bar press - defeat enemy if word is complete
	 */
	private handleSpaceBar(): void {
		if (this.targetedIds.length === 0) return;
		
		// Find all complete words among targeted enemies
		const completeIds: number[] = [];
		for (const id of this.targetedIds) {
			const word = this.getWordForId(id);
			if (word && this.typedText.toLowerCase() === word.toLowerCase()) {
				completeIds.push(id);
			}
		}
		
		if (completeIds.length === 0) return; // No complete words
		
		// If multiple enemies have the same complete word, find the closest one
		let targetId: number;
		if (completeIds.length > 1) {
			const closestId = this.getClosestMatchingEnemy(completeIds, this.typedText);
			targetId = closestId ?? completeIds[0];
		} else {
			targetId = completeIds[0];
		}
		
		this.onWordComplete(targetId);
		this.reset();
	}
}

export default KeyboardController;
