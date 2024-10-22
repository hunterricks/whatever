// ... (keep the existing imports and add the following)
import { StarIcon } from "lucide-react";

// ... (keep the existing code and add the following after the messaging component)

{job.status === 'completed' && (
  <Card className="mb-8">
    <CardHeader>
      <CardTitle>Submit a Review</CardTitle>
    </CardHeader>
    <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitReview)} className="space-y-8">
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rating</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={`h-6 w-6 cursor-pointer ${
                          star <= field.value ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        onClick={() => field.onChange(star)}
                      />
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comment</FormLabel>
                <FormControl>
                  <Textarea placeholder="Write your review here" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmittingReview}>
            {isSubmittingReview ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </Form>
    </CardContent>
  </Card>
)}

{reviews.length > 0 && (
  <Card className="mb-8">
    <CardHeader>
      <CardTitle>Reviews</CardTitle>
    </CardHeader>
    <CardContent>
      {reviews.map((review) => (
        <Card key={review._id} className="mb-4">
          <CardHeader>
            <CardTitle>{review.reviewer.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`h-5 w-5 ${
                    star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p>{review.comment}</p>
          </CardContent>
        </Card>
      ))}
    </CardContent>
  </Card>
)}

// ... (keep the rest of the existing code)