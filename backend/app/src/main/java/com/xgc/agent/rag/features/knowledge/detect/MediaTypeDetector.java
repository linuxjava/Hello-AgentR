package com.xgc.agent.rag.features.knowledge.detect;

import com.xgc.agent.framework.base.error.exception.WebAdminException;
import com.xgc.agent.rag.features.knowledge.error.KnowledgeErrorCode;
import org.apache.tika.detect.DefaultDetector;
import org.apache.tika.detect.Detector;
import org.apache.tika.io.TikaInputStream;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.metadata.TikaCoreProperties;
import org.apache.tika.mime.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.Set;

/**
 * 以 Tika 探测结果为 MIME 权威，不信客户端 Content-Type。
 *
 * <p>Markdown 几乎没有魔数，必须带上 OriginalFilename，否则会退化成 text/plain。</p>
 */
@Component
public class MediaTypeDetector {

    private static final Set<String> MARKDOWN_ALIASES = Set.of(
            "text/markdown",
            "text/x-markdown",
            "text/x-web-markdown"
    );

    private static final Set<String> ALLOWED = Set.of(
            "text/plain",
            "text/markdown",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "image/png",
            "image/jpeg",
            "image/svg+xml"
    );

    private final Detector detector = new DefaultDetector();

    /**
     * @param content           文件字节
     * @param originalFilename  原始文件名，可空
     * @return 规范化后的白名单 MIME
     */
    public String detectAllowed(byte[] content, String originalFilename) {
        Metadata metadata = new Metadata();
        if (StringUtils.hasText(originalFilename)) {
            metadata.set(TikaCoreProperties.RESOURCE_NAME_KEY, originalFilename);
        }
        try (TikaInputStream stream = TikaInputStream.get(content, metadata)) {
            MediaType mediaType = detector.detect(stream, metadata);
            String normalized = normalize(mediaType);
            if (!ALLOWED.contains(normalized)) {
                throw new WebAdminException(KnowledgeErrorCode.FILE_TYPE_UNSUPPORTED);
            }
            return normalized;
        } catch (IOException ex) {
            throw new WebAdminException(
                    KnowledgeErrorCode.FILE_TYPE_UNSUPPORTED.message(),
                    ex,
                    KnowledgeErrorCode.FILE_TYPE_UNSUPPORTED);
        }
    }

    private static String normalize(MediaType mediaType) {
        if (mediaType == null) {
            return "";
        }
        String raw = mediaType.getBaseType().toString();
        if (MARKDOWN_ALIASES.contains(raw)) {
            return "text/markdown";
        }
        return raw;
    }
}
