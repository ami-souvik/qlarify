import { ProductClarity } from "@/types/architecture";
import { ClarityScore, ClarityThresholds, DEFAULT_THRESHOLDS } from "./types";

export class ClarityDomainService {
    /**
     * Checks if a Product Clarity Model has reached the minimum threshold to proceed to architecture.
     */
    public static getClarityScore(
        clarity: ProductClarity, 
        thresholds: ClarityThresholds = DEFAULT_THRESHOLDS
    ): ClarityScore {
        const missingRequirements: string[] = [];

        if ((clarity.personas?.length || 0) < thresholds.minPersonas) {
            missingRequirements.push(`${thresholds.minPersonas}+ Persona`);
        }
        if ((clarity.problems?.length || 0) < thresholds.minProblems) {
            missingRequirements.push(`${thresholds.minProblems}+ Problem`);
        }
        if ((clarity.capabilities?.length || 0) < thresholds.minCapabilities) {
            missingRequirements.push(`${thresholds.minCapabilities}+ Capabilities`);
        }
        
        const dataPointCount = (clarity.dataInputs?.length || 0) + (clarity.dataOutputs?.length || 0);
        if (dataPointCount < thresholds.minDataPoints) {
            missingRequirements.push(`${thresholds.minDataPoints}+ Data Point (Input/Output)`);
        }

        const constraintCount = (clarity.constraints?.length || 0) + (clarity.nonFunctionalRequirements?.length || 0);
        if (constraintCount < thresholds.minConstraints) {
            missingRequirements.push(`${thresholds.minConstraints}+ Constraint/NFR`);
        }

        return {
            isThresholdReached: missingRequirements.length === 0,
            missingRequirements
        };
    }
}
