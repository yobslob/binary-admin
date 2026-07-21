export async function uploadToCloudinary(file: File): Promise<string> {
  // Use the cloud name provided by the user
  const cloudName = 'gezel44f';
  // Standard unsigned upload preset we assume is configured
  const uploadPreset = 'binary_admin_unsigned'; // User should create this in Cloudinary settings

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const resourceType = file.type.startsWith('video/') ? 'video' : 'auto';

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to upload to Cloudinary');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}
