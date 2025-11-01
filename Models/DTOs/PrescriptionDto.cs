// Update the MedicineDto in Models/DTOs/PrescriptionDto.cs
using System.Text.Json.Serialization;

namespace Hospital_Management_system.Models.DTOs
{
    public class PrescriptionDto
    {
        public int AppointmentId { get; set; }
        public string Diagnosis { get; set; }
        public List<MedicineDto> Medicines { get; set; }
        public string ChiefComplaints { get; set; }
        public string PastHistory { get; set; }
        public string Examination { get; set; }
        public string Advice { get; set; }

        // Added for completing appointment
        public decimal? InvoiceAmount { get; set; }
    }

    public class MedicineDto
    {
        [JsonPropertyName("slNo")]
        public int SlNo { get; set; }

        [JsonPropertyName("medicineID")]
        public int MedicineID { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("pricePerTablet")]
        public decimal PricePerTablet { get; set; }

        [JsonPropertyName("morningBefore")]
        public int MorningBefore { get; set; }

        [JsonPropertyName("morningAfter")]
        public int MorningAfter { get; set; }

        [JsonPropertyName("afternoonBefore")]
        public int AfternoonBefore { get; set; }

        [JsonPropertyName("afternoonAfter")]
        public int AfternoonAfter { get; set; }

        [JsonPropertyName("nightBefore")]
        public int NightBefore { get; set; }

        [JsonPropertyName("nightAfter")]
        public int NightAfter { get; set; }

        [JsonPropertyName("days")]
        public int Days { get; set; }
    }
}