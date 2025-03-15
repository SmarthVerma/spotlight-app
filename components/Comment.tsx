import { View, Text, Image } from "react-native";
import { styles } from "@/styles/feed.styles";
import { formatDistanceToNow } from "date-fns";

interface Comment {
    content: string;
    _creationTime: number;
    user: {
        fullname: string
        image: string
    }
}


export default function Comment({ comment }: { comment: Comment }) {

    console.log('this is comment ', comment._creationTime, typeof comment)

    if (!comment) return null
    return (
        <View style={styles.commentContainer}>
            <Image source={{ uri: comment?.user?.image }} style={styles.commentAvatar} />
            <View style={styles.commentContent}>
                <Text style={styles.commentUsername}> {comment?.user?.fullname} </Text>
                <Text style={styles.commentText}>{comment?.content}</Text>
                <Text style={styles.commentTime}>
                    
                    {comment?._creationTime && formatDistanceToNow(comment?._creationTime, { addSuffix: true })}
                </Text>
            </View>
        </View>
    )
}