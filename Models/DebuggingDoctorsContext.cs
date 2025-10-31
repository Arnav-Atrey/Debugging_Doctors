using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace Hospital_Management_system.Models;

public partial class DebuggingDoctorsContext : DbContext
{
    public DebuggingDoctorsContext()
    {
    }

    public DebuggingDoctorsContext(DbContextOptions<DebuggingDoctorsContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Appointment> Appointments { get; set; }

    public virtual DbSet<Doctor> Doctors { get; set; }

    public virtual DbSet<Patient> Patients { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public DbSet<Prescription> Prescriptions { get; set; }  // New DbSet

    public virtual DbSet<Admin> Admins { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("Name=ConnectionStrings:mycon");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Apply global query filters for soft delete
        modelBuilder.Entity<User>().HasQueryFilter(u => !u.IsDeleted);
        modelBuilder.Entity<Doctor>().HasQueryFilter(d => !d.IsDeleted);
        modelBuilder.Entity<Patient>().HasQueryFilter(p => !p.IsDeleted);
        modelBuilder.Entity<Appointment>().HasQueryFilter(a => !a.IsDeleted);
        modelBuilder.Entity<Admin>().HasQueryFilter(a => !a.IsDeleted);

        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.HasKey(e => e.AppointmentId).HasName("PK__Appointm__8ECDFCA231D090B1");

            entity.Property(e => e.AppointmentId).HasColumnName("AppointmentID");
            entity.Property(e => e.AppointmentDate).HasColumnType("datetime");
            entity.Property(e => e.AppointmentStatus)
                .HasMaxLength(20)
                .HasColumnName("Appointment_Status");
            entity.Property(e => e.DoctorId).HasColumnName("DoctorID");
            entity.Property(e => e.InvoiceAmount)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("Invoice_Amount");
            entity.Property(e => e.InvoiceStatus)
                .HasMaxLength(20)
                .HasColumnName("Invoice_Status");
            entity.Property(e => e.PatientId).HasColumnName("PatientID");

            entity.HasOne(d => d.Doctor).WithMany(p => p.Appointments)
                .HasForeignKey(d => d.DoctorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Appointments_Doctors");

            entity.HasOne(d => d.Patient).WithMany(p => p.Appointments)
                .HasForeignKey(d => d.PatientId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Appointments_Patients");
        });

        modelBuilder.Entity<Doctor>(entity =>
        {
            entity.HasKey(e => e.DocId).HasName("PK__Doctors__3EF1888D07BE4677");

            entity.Property(e => e.DocId).HasColumnName("DocID");
            entity.Property(e => e.Availability).HasMaxLength(255);
            entity.Property(e => e.ContactNo).HasMaxLength(20);
            entity.Property(e => e.HPID).HasMaxLength(100);
            entity.Property(e => e.FullName).HasMaxLength(100);
            entity.Property(e => e.Specialisation).HasMaxLength(100);
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.User).WithMany(p => p.Doctors)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_Doctors_Users");
        });

        modelBuilder.Entity<Patient>(entity =>
        {
            entity.HasKey(e => e.PatientId).HasName("PK__Patients__970EC3469491DFC1");

            entity.Property(e => e.PatientId).HasColumnName("PatientID");
            entity.Property(e => e.Address).HasMaxLength(255);
            entity.Property(e => e.ContactNo).HasMaxLength(20);
            entity.Property(e => e.Dob).HasColumnName("DOB");
            entity.Property(e => e.FullName).HasMaxLength(100);
            entity.Property(e => e.Gender).HasMaxLength(20);
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.User).WithMany(p => p.Patients)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_Patients_Users");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CCAC1E8B37F6");

            entity.HasIndex(e => e.Email, "UQ__Users__A9D105349795D9BA").IsUnique();

            entity.Property(e => e.UserId).HasColumnName("UserID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.PswdHash).HasMaxLength(255);
            entity.Property(e => e.Role).HasMaxLength(20);
        });

        modelBuilder.Entity<Medicine>().HasData(
        // General Medicine
        new Medicine { MedicineID = 1, Name = "Paracetamol 500mg", Specialization = "General", PricePerTablet = 2.00m },
        new Medicine { MedicineID = 2, Name = "Amoxicillin 500mg", Specialization = "General", PricePerTablet = 10.00m },
        new Medicine { MedicineID = 3, Name = "Cetirizine 10mg", Specialization = "General", PricePerTablet = 3.50m },
        new Medicine { MedicineID = 4, Name = "Metformin 500mg", Specialization = "General", PricePerTablet = 4.00m },

        // Cardiology
        new Medicine { MedicineID = 5, Name = "Amlodipine 5mg", Specialization = "Cardiology", PricePerTablet = 5.00m },
        new Medicine { MedicineID = 6, Name = "Atorvastatin 20mg", Specialization = "Cardiology", PricePerTablet = 8.00m },
        new Medicine { MedicineID = 7, Name = "Clopidogrel 75mg", Specialization = "Cardiology", PricePerTablet = 12.00m },

        // Psychiatry
        new Medicine { MedicineID = 8, Name = "Sertraline 50mg", Specialization = "Psychiatry", PricePerTablet = 15.00m },
        new Medicine { MedicineID = 9, Name = "Escitalopram 10mg", Specialization = "Psychiatry", PricePerTablet = 18.00m },
        new Medicine { MedicineID = 10, Name = "Alprazolam 0.5mg", Specialization = "Psychiatry", PricePerTablet = 7.00m }
        );



        // Configure Prescription relationship
        modelBuilder.Entity<Prescription>()
            .HasOne(p => p.Appointment)
            .WithOne(a => a.Prescription)  // 1:1 (change to WithMany() for 1:M)
            .HasForeignKey<Prescription>(p => p.AppointmentID)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure Admin self-referencing relationship
        modelBuilder.Entity<Admin>(entity =>
        {
            entity.HasKey(e => e.AdminId);

            entity.HasOne(d => d.User)
                .WithMany()
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.ApprovedByAdmin)
                .WithMany(p => p.ApprovedAdmins)
                .HasForeignKey(d => d.ApprovedBy)
                .OnDelete(DeleteBehavior.NoAction); // Prevent cascade delete issues
        });

        base.OnModelCreating(modelBuilder);
    
    }

    // Override SaveChanges to implement soft delete
    public override int SaveChanges()
    {
        UpdateSoftDeleteStatuses();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateSoftDeleteStatuses();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateSoftDeleteStatuses()
    {
        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.Entity is ISoftDeletable entity)
            {
                switch (entry.State)
                {
                    case EntityState.Deleted:
                        // Change from deleted to modified
                        entry.State = EntityState.Modified;
                        entity.IsDeleted = true;
                        entity.DeletedAt = DateTime.UtcNow;
                        // DeletedBy should be set by the controller
                        break;
                }
            }
        }
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
