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

<<<<<<< HEAD
-- Creating Prescriptions table
CREATE TABLE Prescriptions (
    PrescriptionID INT PRIMARY KEY IDENTITY(1,1),
    AppointmentID INT NOT NULL,
    Diagnosis NVARCHAR(MAX),
    MedicinesJson NVARCHAR(MAX),  -- Stored as JSON string for structured medicines
    ChiefComplaints NVARCHAR(MAX),  -- History/Chief Complaints
    PastHistory NVARCHAR(MAX),
    Examination NVARCHAR(MAX),
    Advice NVARCHAR(MAX),
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Prescriptions_Appointments FOREIGN KEY (AppointmentID) REFERENCES Appointments(AppointmentID) ON DELETE CASCADE
);

=======
>>>>>>> origin/bycts9
ALTER TABLE Patients
    ALTER COLUMN Symptoms NVARCHAR(12);
EXEC sp_rename 'Patients.Symptoms', 'Aadhaar_no', 'COLUMN';

ALTER TABLE Doctors
    ALTER COLUMN Dept NVARCHAR(14);
EXEC sp_rename 'Doctors.Dept', 'HPID', 'COLUMN';

<<<<<<< HEAD
-- Create Admins table
CREATE TABLE Admins (
    AdminID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    FullName NVARCHAR(100) NOT NULL,
    Department NVARCHAR(100),
    ContactNo NVARCHAR(20),
    IsApproved BIT NOT NULL DEFAULT 0,
    ApprovedBy INT NULL,
    ApprovedAt DATETIME NULL,
    CONSTRAINT FK_Admins_Users FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    CONSTRAINT FK_Admins_ApprovedBy FOREIGN KEY (ApprovedBy) REFERENCES Admins(AdminID)
);
select * from users
select * from doctors
select * from patients

--password is Admin@12345
INSERT INTO Users (Email, PswdHash, Role, CreatedAt)
VALUES ('swasthratechadmin@swasthatech.com', '6f2cb9dd8f4b65e24e1c3f3fa5bc57982349237f11abceacd45bbcb74d621c25', 'Admin', GETDATE());

DECLARE @AdminUserId INT = SCOPE_IDENTITY();
INSERT INTO Admins (UserID, FullName, Department, ContactNo, IsApproved, ApprovedAt)
VALUES (@AdminUserId, 'Admin Prime', 'Administration', '9365728476', 1, GETDATE());
update admins set FullName='Admin Prime' where AdminID=1;
select * from users
select * from doctors
select * from patients
select * from admins
select * from appointments

-- Add soft delete columns to Users table
ALTER TABLE Users
ADD IsDeleted BIT NOT NULL DEFAULT 0,
    DeletedAt DATETIME NULL,
    DeletedBy INT NULL;

-- Add soft delete columns to Doctors table
ALTER TABLE Doctors
ADD IsDeleted BIT NOT NULL DEFAULT 0,
    DeletedAt DATETIME NULL,
    DeletedBy INT NULL;

-- Add soft delete columns to Patients table
ALTER TABLE Patients
ADD IsDeleted BIT NOT NULL DEFAULT 0,
    DeletedAt DATETIME NULL,
    DeletedBy INT NULL;

-- Add soft delete columns to Appointments table
ALTER TABLE Appointments
ADD IsDeleted BIT NOT NULL DEFAULT 0,
    DeletedAt DATETIME NULL,
    DeletedBy INT NULL;

-- Add soft delete columns to Admins table
ALTER TABLE Admins
ADD IsDeleted BIT NOT NULL DEFAULT 0,
    DeletedAt DATETIME NULL,
    DeletedBy INT NULL;

-- Create indexes for better query performance
CREATE INDEX IX_Users_IsDeleted ON Users(IsDeleted);
CREATE INDEX IX_Doctors_IsDeleted ON Doctors(IsDeleted);
CREATE INDEX IX_Patients_IsDeleted ON Patients(IsDeleted);
CREATE INDEX IX_Appointments_IsDeleted ON Appointments(IsDeleted);
CREATE INDEX IX_Admins_IsDeleted ON Admins(IsDeleted);

=======
>>>>>>> origin/bycts9
------------------------------------------------------------------------------------------------------
CREATE PROCEDURE GetPatientDataForApprovedAppointment
    @AppointmentId INT,
    @UserId INT,
    @UserRole VARCHAR(10) -- 'Doctor' or 'Patient'
AS
BEGIN
    SET NOCOUNT ON;

    -- Declare variables for error handling
    DECLARE @ErrorMessage NVARCHAR(4000);
    DECLARE @ErrorSeverity INT;
    DECLARE @ErrorState INT;

    BEGIN TRY
        -- Validate inputs
        IF @AppointmentId <= 0 OR @UserId <= 0 OR @UserRole NOT IN ('Doctor', 'Patient')
        BEGIN
            SET @ErrorMessage = 'Invalid AppointmentId, UserId, or UserRole. AppointmentId and UserId must be positive integers, and UserRole must be ''Doctor'' or ''Patient''.';
            RAISERROR (@ErrorMessage, 16, 1);
            RETURN;
        END

        -- Doctor access: Retrieve patient data for approved appointments
        IF @UserRole = 'Doctor'
        BEGIN
            -- Check if the appointment exists, is approved, and belongs to the doctor
            IF NOT EXISTS (
                SELECT 1
                FROM Appointments
                WHERE AppointmentId = @AppointmentId
                AND DoctorId = @UserId
                AND IsApproved = 1
            )
            BEGIN
                SET @ErrorMessage = 'Appointment not found, not approved, or does not belong to the specified doctor.';
                RAISERROR (@ErrorMessage, 16, 1);
                RETURN;
            END

            -- Retrieve patient data
            SELECT 
                p.PatientId,
<<<<<<< HEAD
                p.FullName,
                p.Aadhaar_no,
                p.ContactNo, -- Adjust based on actual Patient table columns
=======
                p.Name,
                p.AadhaarNo,
                p.Contact, -- Adjust based on actual Patient table columns
>>>>>>> origin/bycts9
                p.DOB,    -- Adjust based on actual Patient table columns
                a.AppointmentId,
                a.AppointmentDate,
                a.Symptoms
            FROM Patients p
            INNER JOIN Appointments a ON p.PatientId = a.PatientId
            WHERE a.AppointmentId = @AppointmentId
            AND a.DoctorId = @UserId
            AND a.IsApproved = 1;
        END
        -- Patient access: Retrieve their own appointment data
        ELSE IF @UserRole = 'Patient'
        BEGIN
            -- Check if the appointment exists and belongs to the patient
            IF NOT EXISTS (
                SELECT 1
                FROM Appointments
                WHERE AppointmentId = @AppointmentId
                AND PatientId = @UserId
            )
            BEGIN
                SET @ErrorMessage = 'Appointment not found or does not belong to the specified patient.';
                RAISERROR (@ErrorMessage, 16, 1);
                RETURN;
            END

            -- Retrieve appointment data (excluding sensitive patient data like AadhaarNo)
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
        -- Capture error details
        SET @ErrorMessage = ERROR_MESSAGE();
        SET @ErrorSeverity = ERROR_SEVERITY();
        SET @ErrorState = ERROR_STATE();

        -- Return the error
        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END