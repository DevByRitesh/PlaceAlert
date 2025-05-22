import { addDrive } from "@/context/DataContext";
import sampleDrives from "./addSampleDrives";

const seedDrives = async () => {
  try {
    console.log("Starting to seed drives...");
    
    for (const drive of sampleDrives) {
      try {
        await addDrive(drive);
        console.log(`Successfully added drive for ${drive.companyName}`);
      } catch (error) {
        console.error(`Error adding drive for ${drive.companyName}:`, error);
      }
    }
    
    console.log("Finished seeding drives!");
  } catch (error) {
    console.error("Error seeding drives:", error);
  }
};

// Run the seeding function
seedDrives(); 