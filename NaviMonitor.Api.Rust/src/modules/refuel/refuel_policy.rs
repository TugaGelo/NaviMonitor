//! Pure rules for fill-ups. No I/O.

/// A new fill-up must read higher than every earlier one for the vehicle,
/// same as the .NET API. `highest` is `None` when there are no fill-ups yet.
pub fn check_new_odometer(odometer: i32, highest: Option<i32>) -> Result<(), String> {
    let highest = highest.unwrap_or(0);
    if odometer > highest {
        Ok(())
    } else {
        Err(format!(
            "Invalid Odometer. The reading must be higher than your last recorded mileage ({highest})."
        ))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn first_fill_up_needs_a_positive_reading() {
        assert!(check_new_odometer(1, None).is_ok());
        assert!(check_new_odometer(0, None).is_err());
    }

    #[test]
    fn must_be_strictly_higher_than_the_last() {
        assert!(check_new_odometer(15_001, Some(15_000)).is_ok());
        let err = check_new_odometer(15_000, Some(15_000)).unwrap_err();
        assert!(err.contains("(15000)"));
    }
}
