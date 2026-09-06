from decimal import Decimal, ROUND_HALF_UP

def calculate_premium(plan, age: int, coverage_amount=None):
    """
    Calculates estimated insurance premium based on:
    - Base Premium (from the chosen InsurancePlan)
    - Age Adjustment (risk based on policyholder age)
    - Coverage Adjustment (proportional scaling if coverage requested differs from plan default)

    Formula:
        Final Premium = Base Premium + Age Adjustment + Coverage Adjustment
    """
    base = Decimal(str(plan.base_premium))
    requested_coverage = Decimal(str(coverage_amount)) if coverage_amount else Decimal(str(plan.coverage_amount))
    plan_coverage = Decimal(str(plan.coverage_amount))

    # 1. Age Adjustment
    age_adjustment = Decimal('0.00')
    if plan.insurance_type == 'LIFE':
        if age > 30:
            # 1.5% increase for each year over 30
            age_factor = Decimal(str((age - 30) * 0.015))
            age_adjustment = base * age_factor
    elif plan.insurance_type == 'HEALTH':
        if age > 40:
            # 2.0% increase for each year over 40
            age_factor = Decimal(str((age - 40) * 0.020))
            age_adjustment = base * age_factor
        elif age < 25:
            # 5% youth discount on health
            age_adjustment = - (base * Decimal('0.05'))
    elif plan.insurance_type == 'VEHICLE':
        if age < 25:
            # 10% risk loading for drivers under 25
            age_adjustment = base * Decimal('0.10')
    elif plan.insurance_type == 'TRAVEL':
        if age > 60:
            # 15% senior traveler loading
            age_adjustment = base * Decimal('0.15')

    # 2. Coverage Adjustment (proportional adjustment if user selects custom coverage)
    coverage_adjustment = Decimal('0.00')
    if plan_coverage > 0 and requested_coverage != plan_coverage:
        diff_ratio = (requested_coverage - plan_coverage) / plan_coverage
        coverage_adjustment = base * diff_ratio * Decimal('0.75')  # 75% marginal cost ratio

    total_premium = base + age_adjustment + coverage_adjustment

    # Ensure premium is at least 50% of base
    if total_premium < base * Decimal('0.50'):
        total_premium = base * Decimal('0.50')

    # Round to 2 decimal places
    base = base.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    age_adjustment = age_adjustment.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    coverage_adjustment = coverage_adjustment.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    total_premium = total_premium.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    return {
        "plan_id": plan.id,
        "plan_name": plan.plan_name,
        "insurance_type": plan.insurance_type,
        "age": age,
        "requested_coverage": float(requested_coverage),
        "base_premium": float(base),
        "age_adjustment": float(age_adjustment),
        "coverage_adjustment": float(coverage_adjustment),
        "final_premium": float(total_premium)
    }
