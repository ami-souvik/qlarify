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

        if ((clarity.targetPersonas?.length || 0) < thresholds.minPersonas * 20) {
            missingRequirements.push(`More Persona details`);
        }
        if ((clarity.problemStatements?.length || 0) < thresholds.minProblems * 20) {
            missingRequirements.push(`More Problem details`);
        }
        if ((clarity.coreCapabilities?.length || 0) < thresholds.minCapabilities * 10) {
            missingRequirements.push(`More Capabilities`);
        }
        
        const dataPointCount = clarity.dataInputsOutputs?.length || 0;
        if (dataPointCount < thresholds.minDataPoints * 10) {
            missingRequirements.push(`More Data Points (Input/Output)`);
        }

        const constraintCount = clarity.constraints?.length || 0;
        if (constraintCount < thresholds.minConstraints * 10) {
            missingRequirements.push(`More Constraints/NFRs`);
        }

        return {
            isThresholdReached: missingRequirements.length === 0,
            missingRequirements
        };
    }
}
