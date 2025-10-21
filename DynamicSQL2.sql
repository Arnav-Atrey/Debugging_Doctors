CREATE OR ALTER PROCEDURE GetPatientDataForApprovedAppointment
    @AppointmentId INT,
    @DoctorId INT,  -- Changed from @UserId
    @UserRole VARCHAR(10) -- 'Doctor' or 'Patient'
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ErrorMessage NVARCHAR(4000);
    DECLARE @ErrorSeverity INT;
    DECLARE @ErrorState INT;

    BEGIN TRY
        -- Validate inputs
        IF @AppointmentId <= 0 OR @DoctorId <= 0 OR @UserRole NOT IN ('Doctor', 'Patient')
        BEGIN
            SET @ErrorMessage = 'Invalid AppointmentId, DoctorId, or UserRole.';
            RAISERROR (@ErrorMessage, 16, 1);
            RETURN;
        END

        -- Doctor access
        IF @UserRole = 'Doctor'
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM Appointments
                WHERE AppointmentId = @AppointmentId
                AND DoctorId = @DoctorId  -- Now using DoctorId directly
                AND IsApproved = 1
            )
            BEGIN
                SET @ErrorMessage = 'Appointment not found, not approved, or does not belong to the doctor.';
                RAISERROR (@ErrorMessage, 16, 1);
                RETURN;
            END

            SELECT 
                p.PatientID,
                p.FullName,
                p.Aadhaar_no,
                p.ContactNo,
                p.DOB,
                p.Gender,
                p.Address,
                DATEDIFF(YEAR, p.DOB, GETDATE()) - 
                    CASE 
                        WHEN DATEADD(YEAR, DATEDIFF(YEAR, p.DOB, GETDATE()), p.DOB) > GETDATE() 
                        THEN 1 
                        ELSE 0 
                    END AS Age,
                a.AppointmentId,
                a.AppointmentDate,
                a.Symptoms
            FROM Patients p
            INNER JOIN Appointments a ON p.PatientID = a.PatientID
            WHERE a.AppointmentId = @AppointmentId
            AND a.DoctorId = @DoctorId  -- Now using DoctorId directly
            AND a.IsApproved = 1;
        END

        -- Patient access (if needed in future)
        ELSE IF @UserRole = 'Patient'
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM Appointments
                WHERE AppointmentId = @AppointmentId
                AND PatientId = @DoctorId  -- This would be PatientId if Patient role
            )
            BEGIN
                SET @ErrorMessage = 'Appointment not found or does not belong to the patient.';
                RAISERROR (@ErrorMessage, 16, 1);
                RETURN;
            END

            SELECT 
                a.AppointmentId,
                a.DoctorId,
                a.AppointmentDate,
                a.Symptoms,
                a.IsApproved
            FROM Appointments a
            WHERE a.AppointmentId = @AppointmentId
            AND a.PatientId = @DoctorId;
        END
    END TRY
    BEGIN CATCH
        SET @ErrorMessage = ERROR_MESSAGE();
        SET @ErrorSeverity = ERROR_SEVERITY();
        SET @ErrorState = ERROR_STATE();
        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END