namespace Hospital_Management_system.Models.DTOs
{
    public class PrescriptionDto
    {
        public int AppointmentId { get; set; }
        public string Diagnosis { get; set; }
        public List<MedicineDto> Medicines { get; set; }
<<<<<<< HEAD
        public string ChiefComplaints { get; set; }
        public string PastHistory { get; set; }
        public string Examination { get; set; }
        public string Advice { get; set; }

        // Added for completing appointment
        public decimal? InvoiceAmount { get; set; }
=======

        public string ChiefComplaints { get; set; }
        public string PastHistory { get; set; }
        public string Examination { get; set; }
        public string Advice { get; set; }
>>>>>>> origin/bycts9
    }

    public class MedicineDto
    {
        public int SlNo { get; set; }
        public string Name { get; set; }
        public int MorningBefore { get; set; }
        public int MorningAfter { get; set; }
        public int AfternoonBefore { get; set; }
        public int AfternoonAfter { get; set; }
        public int NightBefore { get; set; }
        public int NightAfter { get; set; }
        public int Days { get; set; }
    }
}