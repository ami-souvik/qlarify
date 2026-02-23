import { ProductClarity } from "@/types/architecture";

export interface ClarityThresholds {
    minPersonas: number;
    minProblems: number;
    minCapabilities: number;
    minDataPoints: number;
    minConstraints: number;
}

export const DEFAULT_THRESHOLDS: ClarityThresholds = {
    minPersonas: 1,
    minProblems: 1,
    minCapabilities: 3,
    minDataPoints: 1, // Sum of inputs and outputs
    minConstraints: 1, // Sum of constraints and NFRs
};

export interface ClarityScore {
    isThresholdReached: boolean;
    missingRequirements: string[];
}
