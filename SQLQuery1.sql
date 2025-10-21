create database Debugging_Doctors;

use Debugging_Doctors;

-- Creating Users table
CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PswdHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(20) NOT NULL CHECK (Role IN ('Doctor', 'Patient', 'Admin')),
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
);

-- Creating Doctors table
CREATE TABLE Doctors (
    DocID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    FullName NVARCHAR(100) NOT NULL,
    Specialisation NVARCHAR(100),
    Dept NVARCHAR(100),
    Availability NVARCHAR(255),
    ContactNo NVARCHAR(20),
    CONSTRAINT FK_Doctors_Users FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- Creating Patients table
CREATE TABLE Patients (
    PatientID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    FullName NVARCHAR(100) NOT NULL,
    DOB DATE,
    Gender NVARCHAR(20),
    ContactNo NVARCHAR(20),
    Address NVARCHAR(255),
    Symptoms NVARCHAR(MAX),
    CONSTRAINT FK_Patients_Users FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- Creating Appointments table
CREATE TABLE Appointments (
    AppointmentID INT PRIMARY KEY IDENTITY(1,1),
    PatientID INT NOT NULL,
    DoctorID INT NOT NULL,
    Appointment_Status NVARCHAR(20) NOT NULL CHECK (Appointment_Status IN ('Scheduled', 'Completed', 'Cancelled','Pending','Rejected')),
    AppointmentDate DATETIME NOT NULL,
    Symptoms NVARCHAR(MAX),
    Diagnosis NVARCHAR(MAX),
    Medicines NVARCHAR(MAX),
    Invoice_Status NVARCHAR(20) NOT NULL CHECK (Invoice_Status IN ('Pending', 'Paid', 'Cancelled')),
    Invoice_Amount DECIMAL(10,2),
    CONSTRAINT FK_Appointments_Patients FOREIGN KEY (PatientID) REFERENCES Patients(PatientID) ON DELETE NO ACTION,
    CONSTRAINT FK_Appointments_Doctors FOREIGN KEY (DoctorID) REFERENCES Doctors(DocID) ON DELETE NO ACTION
);

ALTER TABLE Patients
    ALTER COLUMN Symptoms NVARCHAR(12);
EXEC sp_rename 'Patients.Symptoms', 'Aadhaar_no', 'COLUMN';

ALTER TABLE Doctors
    ALTER COLUMN Dept NVARCHAR(14);
EXEC sp_rename 'Doctors.Dept', 'HPID', 'COLUMN';

ALTER TABLE Appointments
ADD IsApproved BIT NOT NULL DEFAULT 0;


------------------------------------------------------------------------------------------------------
CREATE PROCEDURE GetPatientDataForApprovedAppointment
    @AppointmentId INT,
    @UserId INT,
    @UserRole VARCHAR(10) -- 'Doctor' or 'Patient'
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ErrorMessage NVARCHAR(4000);
    DECLARE @ErrorSeverity INT;
    DECLARE @ErrorState INT;

    BEGIN TRY
        -- Validate inputs
        IF @AppointmentId <= 0 OR @UserId <= 0 OR @UserRole NOT IN ('Doctor', 'Patient')
        BEGIN
            SET @ErrorMessage = 'Invalid AppointmentId, UserId, or UserRole.';
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
                AND DoctorId = @UserId
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
                a.AppointmentId,
                a.AppointmentDate,
                a.Symptoms
            FROM Patients p
            INNER JOIN Appointments a ON p.PatientID = a.PatientID
            WHERE a.AppointmentId = @AppointmentId
            AND a.DoctorId = @UserId
            AND a.IsApproved = 1;
        END

        -- Patient access
        ELSE IF @UserRole = 'Patient'
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM Appointments
                WHERE AppointmentId = @AppointmentId
                AND PatientId = @UserId
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
            AND a.PatientId = @UserId;
        END
    END TRY
    BEGIN CATCH
        SET @ErrorMessage = ERROR_MESSAGE();
        SET @ErrorSeverity = ERROR_SEVERITY();
        SET @ErrorState = ERROR_STATE();
        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END


select * from Users
select * from Doctors
select * from Patients
select * from Appointments





ALTER TABLE Appointments
DROP CONSTRAINT CK__Appointme__Appoi__5441852A;

ALTER TABLE Appointments
ADD CONSTRAINT CK__Appointme__Appoi__5441852A
CHECK ([Appointment_Status] IN ('Rejected', 'Pending', 'Cancelled', 'Completed', 'Scheduled', 'Confirmed'));

