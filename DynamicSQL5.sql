-- Set IsApproved = 0 for all appointments where it's NULL
UPDATE Appointments
SET IsApproved = 0
WHERE IsApproved IS NULL;

-- Make sure the column has a default value
ALTER TABLE Appointments
ADD CONSTRAINT DF_Appointments_IsApproved DEFAULT 0 FOR IsApproved;

SELECT 
    dc.name AS DefaultConstraintName
FROM 
    sys.default_constraints dc
JOIN 
    sys.columns c ON dc.parent_object_id = c.object_id
                  AND dc.parent_column_id = c.column_id
WHERE 
    c.object_id = OBJECT_ID('Appointments') 
    AND c.name = 'IsApproved';




ALTER TABLE Appointments
DROP CONSTRAINT DF__Appointme__IsApp__45F365D3;

ALTER TABLE Appointments
ADD CONSTRAINT DF_Appointments_IsApproved DEFAULT 0 FOR IsApproved;

UPDATE Appointments
SET IsApproved = 0
WHERE IsApproved IS NULL;

ALTER TABLE Appointments
ALTER COLUMN IsApproved BIT NOT NULL;

ALTER TABLE Appointments
ADD CONSTRAINT DF_Appointments_IsApproved DEFAULT 0 FOR IsApproved;


SELECT 
    dc.name AS DefaultConstraintName
FROM 
    sys.default_constraints dc
JOIN 
    sys.columns c ON dc.parent_object_id = c.object_id
                  AND dc.parent_column_id = c.column_id
WHERE 
    c.object_id = OBJECT_ID('Appointments') 
    AND c.name = 'IsApproved';




    SELECT 
    AppointmentId, 
    PatientId, 
    DoctorId, 
    Appointment_Status, 
    IsApproved,
    AppointmentDate,
    Invoice_Status
FROM Appointments
WHERE AppointmentId = 1;


UPDATE Appointments
SET Appointment_Status = 'Confirmed', IsApproved = 1
WHERE AppointmentId = 1;


-- Drop the old constraint
ALTER TABLE Appointments
DROP CONSTRAINT CK__Appointme__Appoi__4222D4EF;

-- Add the corrected constraint with 'Confirmed'
ALTER TABLE Appointments
ADD CONSTRAINT CK_Appointments_Status 
CHECK (Appointment_Status IN ('Rejected', 'Pending', 'Cancelled', 'Completed', 'Scheduled', 'Confirmed'));

-- Verify the constraint
SELECT 
    OBJECT_NAME(parent_object_id) AS TableName,
    name AS ConstraintName,
    definition
FROM sys.check_constraints
WHERE parent_object_id = OBJECT_ID('Appointments');

UPDATE Appointments
   SET Appointment_Status = 'Confirmed', IsApproved = 1
   WHERE AppointmentId = 1;