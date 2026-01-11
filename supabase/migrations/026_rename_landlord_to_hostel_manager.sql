-- Rename landlord_name and landlord_phone to hostel_manager_name and hostel_manager_phone
ALTER TABLE hostels 
  RENAME COLUMN landlord_name TO hostel_manager_name;

ALTER TABLE hostels 
  RENAME COLUMN landlord_phone TO hostel_manager_phone;
