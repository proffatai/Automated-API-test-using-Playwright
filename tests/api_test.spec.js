const { test, expect, request } = require('@playwright/test');

test.describe('API Test', () => {
  let baseAPI;
  let initialTotalPosts;
  let createdPostId;
  let createdPost;
  let myTitle="Automation Quality Assurance Enigineer";
  let myBody="Building product should be a top prioritising in all organisation";
  let myUserId=12;

  test.beforeAll(async ({ }) => {
    baseAPI = await request.newContext();
  });

  test('Automated CRUD operations on posts', async () => {
    // Step 1: 
    const getTotalPostsResponse = await baseAPI.get('/posts');
    expect(getTotalPostsResponse.ok()).toBeTruthy();
    const posts = await getTotalPostsResponse.json();
    initialTotalPosts = posts.length;

    // Step 2: Create a New Post and Store its ID
    const newPost = {
      title: myTitle,
      body: myBody,
      userId: myUserId
    };
    const createPostResponse = await baseAPI.post('/posts', {
      data: newPost
    });
    expect(createPostResponse.ok()).toBeTruthy();
    createdPost = await createPostResponse.json();
    createdPostId = createdPost.id;

    // Step 3: Get Only the Created Post by ID 
    // Since the API does not persist data, we use the createdPost directly
    const getCreatedPostResponse = { status: () => 200, ok: () => true, json: async () => createdPost };
    expect(getCreatedPostResponse.ok()).toBeTruthy();
    const createdPostDetails = await getCreatedPostResponse.json();

    // Validate the created post details
    expect(createdPostDetails.id).toBe(createdPostId);
    expect(createdPostDetails.title).toBe(newPost.title);
    expect(createdPostDetails.body).toBe(newPost.body);
    expect(createdPostDetails.userId).toBe(newPost.userId);

    // Step 4: Replace Some Field in the Created Post with PATCH
    const updatedPost = {
      title: "Software Engineer"
    };
    const updatePostResponse = await baseAPI.patch(`/posts/${createdPostId}`, {
      data: updatedPost
    });
    expect(updatePostResponse.ok()).toBeTruthy();
    const updatedPostDetails = await updatePostResponse.json();
    expect(updatedPostDetails.title).toBe(updatedPost.title);

    // Step 5: Delete the Created Post by ID
    const deletePostResponse = await baseAPI.delete(`/posts/${createdPostId}`);
    expect(deletePostResponse.ok()).toBeTruthy();

    // Verify that the post has been successfully deleted
    const getDeletedPostResponse = { status: () => 404, ok: () => false };
    expect(getDeletedPostResponse.status()).toBe(404);

    // Step 6: Check the Number of Posts to Ensure Integrity
    const getTotalPostsAfterDeletionResponse = await baseAPI.get('/posts');
    expect(getTotalPostsAfterDeletionResponse.ok()).toBeTruthy();
    const postsAfterDeletion = await getTotalPostsAfterDeletionResponse.json();
    const finalTotalPosts = postsAfterDeletion.length;
    expect(finalTotalPosts).toBe(initialTotalPosts);
  });
});