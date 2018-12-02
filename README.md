Y & D Browne 2018
=====

A progress web app (currently only built for mobile viewport use) to be used on the wedding day of Yasmin and Daryl Browne's wedding on october 13th 2018, and kept for memorabilia or digital photo album of some things that transpired on the day.

### Videos and Images
uploaded videos and images are saved as is to firebase storage, but also cropped, resized and compressed in filesize to cloudinary CDN.
The allowed dimensions for images uploaded to cloudinary are:
- Square - 1:1 aspect ratio (max 1080 x 1080)
- Portrait images - 4:5 aspect ratio (max 1350px x 1080px)
- Landscape images - 16:9 aspect ratio (max 1080px x 608px)

The allowed dimensions for videos uploaded to cloudinary are:
- Square - 1:1 aspect ratio (max 640 x 640)

#### Upload process
##### images
When creating an image for a feed:
1. A UUID is generated on the client
2. A feed, and media document is created, alongside an item to firebase storage
  - An image is uploaded to firebase storage using the UUID as the reference path
  - A document is added to firestore collection `media` with an auto generated ID. the document has the following shape: 
    `mediaType`: `image` or `video`. 
    `storageReference`: `string` that is UUID of the image of video to be uploaded.
    complete: `boolean` that becomes true once cloudinary has finished uploading and applying transformations.
    cloudinaryPublicId: `string` that represents the `public_id` from cloudinary.
  - A feed item is created with the following shape
    userId: `string`
    mediaIds: `[string]`.
    caption: `string`.
    headline: `string`.
    complete: `boolean [false]` - this becomes true when all mediaId transformations are `complete`.
    loaderImg: `string` - blurry image url from cloudinary to show whilst fetching and loading media items.
    apectRatio: `square`, `portrait`, `landscape` - useful for setting height whilst loading image.
3. Once the image has been uploaded to firebase storage a cloud function will add the 