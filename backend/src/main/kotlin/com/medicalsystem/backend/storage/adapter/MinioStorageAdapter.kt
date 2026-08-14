package com.medicalsystem.backend.storage.adapter

import com.medicalsystem.backend.storage.port.FileStoragePort
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest
import software.amazon.awssdk.services.s3.model.GetObjectRequest
import software.amazon.awssdk.services.s3.model.HeadObjectRequest
import software.amazon.awssdk.services.s3.model.PutObjectRequest
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest
import java.net.URL
import java.time.Duration

@Service
class MinioStorageAdapter(
    private val s3Client: S3Client,
    private val s3Presigner: S3Presigner,
    @Value("\${storage.s3.bucket:medical-attachments}") private val bucketName: String
) : FileStoragePort {

    private val logger = LoggerFactory.getLogger(MinioStorageAdapter::class.java)

    override fun generatePresignedUploadUrl(
        storageKey: String,
        mimeType: String,
        sizeBytes: Long,
        duration: Duration
    ): URL {
        val putObjectRequest = PutObjectRequest.builder()
            .bucket(bucketName)
            .key(storageKey)
            .contentType(mimeType)
            .contentLength(sizeBytes)
            .build()

        val presignRequest = PutObjectPresignRequest.builder()
            .signatureDuration(duration)
            .putObjectRequest(putObjectRequest)
            .build()

        return s3Presigner.presignPutObject(presignRequest).url()
    }

    override fun generatePresignedDownloadUrl(
        storageKey: String,
        originalFilename: String,
        mimeType: String,
        intent: com.medicalsystem.backend.storage.domain.DownloadIntent,
        duration: Duration
    ): URL {
        val isPreviewable = mimeType == "application/pdf" || mimeType.startsWith("image/")
        val dispositionType = if (intent == com.medicalsystem.backend.storage.domain.DownloadIntent.PREVIEW && isPreviewable) "inline" else "attachment"
        val encodedFilename = java.net.URLEncoder.encode(originalFilename, java.nio.charset.StandardCharsets.UTF_8.toString()).replace("+", "%20")
        val sanitizedPlain = originalFilename.replace("\"", "").replace(";", "").trim()

        val getObjectRequest = GetObjectRequest.builder()
            .bucket(bucketName)
            .key(storageKey)
            .responseContentDisposition("$dispositionType; filename=\"$sanitizedPlain\"; filename*=UTF-8''$encodedFilename")
            .responseContentType(mimeType)
            .build()

        val presignRequest = GetObjectPresignRequest.builder()
            .signatureDuration(duration)
            .getObjectRequest(getObjectRequest)
            .build()

        return s3Presigner.presignGetObject(presignRequest).url()
    }

    override fun getObjectHeaderBytes(storageKey: String, lengthBytes: Long): ByteArray {
        val range = "bytes=0-${lengthBytes - 1}"
        val getObjectRequest = GetObjectRequest.builder()
            .bucket(bucketName)
            .key(storageKey)
            .range(range)
            .build()

        return s3Client.getObject(getObjectRequest).use { it.readAllBytes() }
    }

    override fun getObjectSize(storageKey: String): Long {
        val headObjectRequest = HeadObjectRequest.builder()
            .bucket(bucketName)
            .key(storageKey)
            .build()

        return s3Client.headObject(headObjectRequest).contentLength()
    }

    override fun deleteObject(storageKey: String) {
        logger.info("Deleting object key: {} from bucket: {}", storageKey, bucketName)
        val deleteObjectRequest = DeleteObjectRequest.builder()
            .bucket(bucketName)
            .key(storageKey)
            .build()

        s3Client.deleteObject(deleteObjectRequest)
    }
}
