using Hospital_Management_system.Models;
using Hospital_Management_system.Models.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Security.Cryptography;

namespace Hospital_Management_system.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly DebuggingDoctorsContext _context;

        public UsersController(DebuggingDoctorsContext context)
        {
            _context = context;
        }

        // GET: api/Users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }

        // PUT: api/Users/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(int id, User user)
        {
            if (id != user.UserId)
            {
                return BadRequest();
            }

            _context.Entry(user).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Users
        [HttpPost]
        public async Task<ActionResult<User>> PostUser(UserRegistrationDto userDto)
        {
            // Map DTO to User entity
            var user = new User
            {
                Email = userDto.Email,
                PswdHash = ComputeSHA256Hash(userDto.PswdHash),
                Role = userDto.Role,
                CreatedAt = DateTime.UtcNow, // Set creation date
                Doctors = new List<Doctor>(), // Initialize empty collections
                Patients = new List<Patient>()
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetUser", new { id = user.UserId }, user);
        }

        // POST: api/Users/login
        [HttpPost("login")]
        public async Task<ActionResult<LoginResponseDto>> Login(UserLoginDto loginDto)
        {
            // Find user by email
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null)
            {
                return NotFound(new { message = "This email is not registered. Please check your email or register for a new account." });
            }

            // Compute hash of provided password and compare with stored hash
            string hashedInputPassword = ComputeSHA256Hash(loginDto.PswdHash);
            if (hashedInputPassword != user.PswdHash)
            {
                return Unauthorized(new { message = "Invalid password. Please try again." });
            }

            // Create response
            var response = new LoginResponseDto
            {
                UserId = user.UserId,
                Email = user.Email,
                Role = user.Role
            };

            // Get Patient or Doctor information
            if (user.Role == "Patient")
            {
                var patient = await _context.Patients
                    .FirstOrDefaultAsync(p => p.UserId == user.UserId);

                if (patient != null)
                {
                    response.PatientId = patient.PatientId;
                    response.FullName = patient.FullName;
                }
                else
                {
                    return BadRequest(new { message = "Patient profile not found. Please contact support." });
                }
            }
            else if (user.Role == "Doctor")
            {
                var doctor = await _context.Doctors
                    .FirstOrDefaultAsync(d => d.UserId == user.UserId);

                if (doctor != null)
                {
                    response.DoctorId = doctor.DocId;
                    response.FullName = doctor.FullName;
                }
                else
                {
                    return BadRequest(new { message = "Doctor profile not found. Please contact support." });
                }
            }

            return Ok(response);
        }

        //// POST: api/Users (Registration)
        //[HttpPost]
        //public async Task<ActionResult<User>> Register([FromBody] UserRegistrationDto registrationDto)
        //{
        //    // Check if email already exists
        //    if (await _context.Users.AnyAsync(u => u.Email == registrationDto.Email))
        //    {
        //        return BadRequest(new { message = "This email is already registered. Please use a different email or try logging in." });
        //    }

        //    // Validate role
        //    if (registrationDto.Role != "Doctor" && registrationDto.Role != "Patient" && registrationDto.Role != "Admin")
        //    {
        //        return BadRequest(new { message = "Invalid role" });
        //    }

        //    // Prevent patients from using @swasthatech.com domain
        //    if (registrationDto.Role == "Patient" && registrationDto.Email.ToLower().EndsWith("@swasthatech.com"))
        //    {
        //        return BadRequest(new { message = "@swasthatech.com domain is reserved for internal use only." });
        //    }

        //    using var transaction = await _context.Database.BeginTransactionAsync();

        //    try
        //    {
        //        // Create User
        //        var user = new User
        //        {
        //            Email = registrationDto.Email,
        //            PswdHash = ComputeSHA256Hash(registrationDto.PswdHash), // Hash the password
        //            Role = registrationDto.Role,
        //            CreatedAt = DateTime.Now
        //        };

        //        _context.Users.Add(user);
        //        await _context.SaveChangesAsync();

        //        // Create corresponding Patient or Doctor record
        //        if (registrationDto.Role == "Patient")
        //        {
        //            var patient = new Patient
        //            {
        //                UserId = user.UserId,
        //                FullName = registrationDto.Email.Split('@')[0], // Temporary name from email
        //            };
        //            _context.Patients.Add(patient);
        //            await _context.SaveChangesAsync();
        //        }
        //        else if (registrationDto.Role == "Doctor")
        //        {
        //            var doctor = new Doctor
        //            {
        //                UserId = user.UserId,
        //                FullName = registrationDto.Email.Split('@')[0], // Temporary name from email
        //            };
        //            _context.Doctors.Add(doctor);
        //            await _context.SaveChangesAsync();
        //        }

        //        await transaction.CommitAsync();

        //        return Ok(new { message = "Registration successful", userId = user.UserId });
        //    }
        //    catch (Exception ex)
        //    {
        //        await transaction.RollbackAsync();
        //        return StatusCode(500, new { message = "Registration failed", error = ex.Message });
        //    }
        //}


        private static string ComputeSHA256Hash(string rawData)
        {
            using (SHA256 sha256Hash = SHA256.Create())
            {
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(rawData));
                StringBuilder builder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    builder.Append(bytes[i].ToString("x2"));
                }
                return builder.ToString();
            }
        }

        // DELETE: api/Users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Add this method to your UsersController class (after the PostUser method)

        // POST: api/Users/{userId}/doctor-details
        [HttpPost("{userId}/doctor-details")]
        public async Task<ActionResult<DoctorDetailsDto>> AddDoctorDetails(int userId, DoctorDetailsDto doctorDto)
        {
            // Check if user exists
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Check if user role is Doctor
            if (user.Role != "Doctor")
            {
                return BadRequest("User is not registered as a Doctor.");
            }

            // Check if doctor details already exist for this user
            var existingDoctor = await _context.Doctors
                .FirstOrDefaultAsync(d => d.UserId == userId);

            if (existingDoctor != null)
            {
                return Conflict("Doctor details already exist for this user.");
            }

            // Create new Doctor entity
            var doctor = new Doctor
            {
                UserId = userId,
                FullName = doctorDto.FullName,
                Specialisation = doctorDto.Specialisation,
                HPID = doctorDto.HPID,
                ContactNo = doctorDto.ContactNo,
                Availability = "Available" // Default value
            };

            _context.Doctors.Add(doctor);
            await _context.SaveChangesAsync();

            // Return DTO instead of entity to avoid circular reference
            var responseDto = new DoctorDetailsDto
            {
                FullName = doctor.FullName,
                Specialisation = doctor.Specialisation,
                HPID = doctor.HPID,
                ContactNo = doctor.ContactNo
            };

            return Ok(responseDto);
        }

        // POST: api/Users/{userId}/patient-details
        [HttpPost("{userId}/patient-details")]
        public async Task<ActionResult<PatientDetailsDto>> AddPatientDetails(int userId, PatientDetailsDto patientDto)
        {
            // Check if user exists
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Check if user role is Patient
            if (user.Role != "Patient")
            {
                return BadRequest("User is not registered as a Patient.");
            }

            // Check if patient details already exist for this user
            var existingPatient = await _context.Patients
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (existingPatient != null)
            {
                return Conflict("Patient details already exist for this user.");
            }

            // Create new Patient entity
            var patient = new Patient
            {
                UserId = userId,
                FullName = patientDto.FullName,
                Dob = patientDto.Dob,
                Gender = patientDto.Gender,
                ContactNo = patientDto.ContactNo,
                Address = patientDto.Address,
                Aadhaar_no = patientDto.Aadhaar_no
            };

            _context.Patients.Add(patient);
            await _context.SaveChangesAsync();

            // Return DTO to avoid circular reference
            var responseDto = new PatientDetailsDto
            {
                FullName = patient.FullName,
                Dob = patient.Dob,
                Gender = patient.Gender,
                ContactNo = patient.ContactNo,
                Address = patient.Address,
                Aadhaar_no = patient.Aadhaar_no
            };

            return Ok(responseDto);
        }

        // Note: Make sure you have a DoctorsController with a GetDoctor method,
        // or you can change the CreatedAtAction to return Ok(doctor) instead

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.UserId == id);
        }
    }
}