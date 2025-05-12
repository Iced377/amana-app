"use server";

import type { InheritanceInput, InheritanceCalculationOutput, HeirShare, Madhhab } from '@/locales/settings';

/**
 * Calculates Islamic inheritance shares based on the provided input and Madhhab.
 * 
 * !!! IMPORTANT: THIS IS A MOCK IMPLEMENTATION !!!
 * The actual Faraid calculation logic is extremely complex and varies significantly
 * between Madhāhib (Hanafi, Maliki, Shafi'i, Hanbali) and for numerous specific
 * family scenarios (presence/absence of various heirs, special cases like Kalalah, etc.).
 * 
 * This function needs to be replaced with a robust, well-tested library or custom code
 * developed by experts in Islamic jurisprudence and Faraid.
 * 
 * The mock below provides a very basic example for a Hanafi scenario:
 * Deceased is male, leaves behind: Wife, 1 Son, 1 Daughter.
 * - Debts and Wasiyyah are deducted first.
 * - Wife gets 1/8 (due to presence of children).
 * - Son gets 2 parts of the remainder.
 * - Daughter gets 1 part of the remainder.
 * 
 * THIS DOES NOT COVER:
 * - Blocking rules (Hajb) extensively.
 * - Residuary rules (Asabah) beyond simple son/daughter.
 * - Return (Radd) if shares are less than 1 and no Asabah.
 * - Increase (Awl) if shares exceed 1.
 * - Grandparents, siblings, and other complex relations.
 * - Specific rules for Maliki, Shafi'i, Hanbali schools.
 * - Many other edge cases and specific conditions.
 */
export async function calculateInheritanceShares(
  input: InheritanceInput
): Promise<InheritanceCalculationOutput> {
  console.log("Server Action: calculateInheritanceShares called with input:", input);

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  let netEstate = 100.00; // Assume total estate is 100% for percentage calculation initially
  let wasiyyahAppliedAmount = 0;

  if (input.debtsAmount && input.debtsAmount > 0) {
    // In a real calculation, debts would be deducted from the actual estate value.
    // For percentage, we are simplifying. We'll just note it.
    console.log(`Debts to be paid: ${input.debtsAmount}`);
  }

  if (input.wasiyyahAmount && input.wasiyyahAmount > 0) {
    // Wasiyyah can be up to 1/3 of the estate AFTER debts.
    // For percentage, this is tricky. Let's assume it's a percentage of the initial 100.
    // Max 33.33% for Wasiyyah.
    const maxWasiyyahPercentage = 33.3333;
    let wasiyyahPercentageFromInput = (input.wasiyyahAmount / netEstate) * 100; // If wasiyyah is given as amount from 100
    if (input.wasiyyahPercentage) { // if given as direct percentage
        wasiyyahPercentageFromInput = input.wasiyyahPercentage;
    }

    wasiyyahAppliedAmount = Math.min(wasiyyahPercentageFromInput, maxWasiyyahPercentage);
    netEstate -= wasiyyahAppliedAmount;
  }
  
  const netEstateAfterObligations = netEstate; // This is now the estate to be distributed among heirs.

  const heirs: HeirShare[] = [];
  let remainingEstatePercentage = netEstateAfterObligations;


  // MOCK LOGIC FOR HANAFI - (Deceased Male: Wife, 1 Son, 1 Daughter)
  if (input.madhhab === 'hanafi') {
    if (input.maritalStatus === 'married' && input.hasSpouse && input.spouseGender === 'female') { // Wife
      const wifeSharePercentage = (input.sons > 0 || input.daughters > 0) ? (1/8 * netEstateAfterObligations) : (1/4 * netEstateAfterObligations);
      heirs.push({
        heirKey: 'spouse_wife',
        heirName: 'Wife',
        sharePercentage: wifeSharePercentage,
        shareFraction: (input.sons > 0 || input.daughters > 0) ? '1/8' : '1/4',
        reasonKey: (input.sons > 0 || input.daughters > 0) ? 'reasonWifeWithChildren' : 'reasonWifeNoChildren',
      });
      remainingEstatePercentage -= wifeSharePercentage;
    }

    if (input.fatherAlive) {
        // Father gets 1/6 if there are descendants (son/daughter).
        // If only daughters and no son, father gets 1/6 + residue. This mock is too simple for that.
        if (input.sons > 0 || input.daughters > 0) {
            const fatherShare = (1/6 * netEstateAfterObligations);
            heirs.push({ heirKey: 'father', heirName: 'Father', sharePercentage: fatherShare, shareFraction: '1/6', reasonKey: 'reasonFatherWithDescendants' });
            remainingEstatePercentage -= fatherShare;
        } else {
            // No children, father is Asib (residuary) - this mock won't calculate Asib share correctly if other sharers exist
            // For simplicity, if no children and no spouse, father gets all. If spouse, gets remainder.
            // This is a gross simplification.
        }
    }
    if (input.motherAlive) {
        // Mother gets 1/6 if there are descendants or multiple siblings. 1/3 otherwise.
        // Again, simplifying.
         if (input.sons > 0 || input.daughters > 0 || (input.fullBrothers + input.fullSisters + input.paternalHalfBrothers + input.paternalHalfSisters + input.maternalHalfBrothers + input.maternalHalfSisters) >=2 ) {
            const motherShare = (1/6 * netEstateAfterObligations);
            heirs.push({ heirKey: 'mother', heirName: 'Mother', sharePercentage: motherShare, shareFraction: '1/6', reasonKey: 'reasonMotherWithDescendantsOrSiblings' });
            remainingEstatePercentage -= motherShare;
        } else {
            const motherShare = (1/3 * netEstateAfterObligations); // This might be 1/3 of remainder after spouse in some cases (Umariyyatayn) - too complex for mock
            heirs.push({ heirKey: 'mother', heirName: 'Mother', sharePercentage: motherShare, shareFraction: '1/3', reasonKey: 'reasonMotherNoDescendantsOrFewSiblings' });
            remainingEstatePercentage -= motherShare;
        }
    }


    if (input.sons > 0 && input.daughters > 0) {
      // Ratio 2:1 for son:daughter
      const totalParts = (input.sons * 2) + input.daughters;
      const sonShare = (remainingEstatePercentage / totalParts) * 2;
      const daughterShare = (remainingEstatePercentage / totalParts) * 1;
      if(input.sons > 0) heirs.push({ heirKey: 'sons_group', heirName: `Sons (${input.sons})`, sharePercentage: sonShare * input.sons, reasonKey: 'reasonSonAsResiduary', count: input.sons });
      if(input.daughters > 0) heirs.push({ heirKey: 'daughters_group', heirName: `Daughters (${input.daughters})`, sharePercentage: daughterShare * input.daughters, reasonKey: 'reasonDaughterWithSonAsResiduary', count: input.daughters });
      remainingEstatePercentage = 0; // Consumed by Asabah
    } else if (input.sons > 0) {
      heirs.push({ heirKey: 'sons_group', heirName: `Sons (${input.sons})`, sharePercentage: remainingEstatePercentage, reasonKey: 'reasonSonAsResiduary', count: input.sons });
      remainingEstatePercentage = 0;
    } else if (input.daughters > 0) {
      let daughterGroupSharePercentage;
      if (input.daughters === 1) {
        daughterGroupSharePercentage = 1/2 * netEstateAfterObligations;
        heirs.push({ heirKey: 'daughters_group', heirName: `Daughter (1)`, sharePercentage: daughterGroupSharePercentage, shareFraction: '1/2', reasonKey: 'reasonOneDaughterNoSon', count: 1 });
      } else { // 2 or more daughters
        daughterGroupSharePercentage = 2/3 * netEstateAfterObligations;
        heirs.push({ heirKey: 'daughters_group', heirName: `Daughters (${input.daughters})`, sharePercentage: daughterGroupSharePercentage, shareFraction: '2/3', reasonKey: 'reasonMultipleDaughtersNoSon', count: input.daughters });
      }
      remainingEstatePercentage -= daughterGroupSharePercentage;
    }
    
    // Add simple blocking example: if son exists, full brothers/sisters are blocked.
    if (input.sons > 0) {
        if (input.fullBrothers > 0) heirs.push({ heirKey: 'full_brothers_group', heirName: `Full Brothers (${input.fullBrothers})`, sharePercentage: 0, isBlocked: true, reasonKey: 'reasonBlockedBySon', count: input.fullBrothers });
        if (input.fullSisters > 0) heirs.push({ heirKey: 'full_sisters_group', heirName: `Full Sisters (${input.fullSisters})`, sharePercentage: 0, isBlocked: true, reasonKey: 'reasonBlockedBySon', count: input.fullSisters });
    }


    // This is where Radd (return) or Awl (increase) logic would apply if shares don't sum to remainingEstatePercentage or exceed it.
    // For this mock, we'll just report unassigned residue if any.
    let unassignedResidue = remainingEstatePercentage > 0.01 ? remainingEstatePercentage : undefined; // Check for small positive residue
    if (remainingEstatePercentage < -0.01) { // Shares exceeded available estate
        return {
            netEstateAfterObligations: netEstateAfterObligations,
            wasiyyahAppliedAmount: wasiyyahAppliedAmount > 0 ? wasiyyahAppliedAmount : undefined,
            heirs: heirs,
            calculationNotes: 'calculationNoteAwlNeeded', // Needs Awl (proportional reduction)
            errors: ['Error: Total shares exceed 100%. Awl (increase/proportional reduction) is required but not implemented in this mock.'],
            unassignedResidue: remainingEstatePercentage // Negative residue indicates Awl
        };
    }


    return {
      netEstateAfterObligations: netEstateAfterObligations, // This is a percentage (0-100) in this mock.
      wasiyyahAppliedAmount: wasiyyahAppliedAmount > 0 ? wasiyyahAppliedAmount : undefined,
      heirs: heirs,
      calculationNotes: (unassignedResidue && unassignedResidue > 0) ? 'calculationNoteRaddMayBeNeeded' : 'calculationNoteBasic',
      unassignedResidue: unassignedResidue,
    };

  } else {
    // Placeholder for other Madhāhib
    return {
      netEstateAfterObligations: netEstateAfterObligations,
      wasiyyahAppliedAmount: wasiyyahAppliedAmount > 0 ? wasiyyahAppliedAmount : undefined,
      heirs: [{ heirKey: 'placeholder', heirName: 'Calculation for this Madhhab is not yet implemented in this mock.', sharePercentage: 0, reasonKey: 'madhhabNotImplemented' }],
      calculationNotes: 'madhhabNotImplementedNote',
      errors: [`Mock logic for ${input.madhhab} not implemented. Please select Hanafi for a basic demo.`],
    };
  }
}